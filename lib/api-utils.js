/**
 * API Utilities for Brain Co-Lab
 * Enhanced error handling, retry logic, and rate limiting
 */

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Rate limiter configuration
 */
const RATE_LIMIT_CONFIG = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
};

/**
 * Error types
 */
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
};

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, type, statusCode, details) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Rate limiter implementation
 */
class RateLimiter {
  constructor(maxRequests = RATE_LIMIT_CONFIG.maxRequests, windowMs = RATE_LIMIT_CONFIG.windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async checkLimit() {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      throw new APIError(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        ErrorTypes.RATE_LIMIT_ERROR,
        429,
        { waitTime }
      );
    }

    this.requests.push(now);
    return true;
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Sleep utility for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const calculateBackoff = (attempt, config = RETRY_CONFIG) => {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

/**
 * Validate API response
 */
const validateResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new APIError(
        'Authentication failed. Please check your API key.',
        ErrorTypes.AUTH_ERROR,
        response.status,
        errorData
      );
    }

    if (response.status === 429) {
      throw new APIError(
        'Rate limit exceeded from API provider.',
        ErrorTypes.RATE_LIMIT_ERROR,
        response.status,
        errorData
      );
    }

    throw new APIError(
      errorData.message || `API request failed with status ${response.status}`,
      ErrorTypes.API_ERROR,
      response.status,
      errorData
    );
  }

  return response;
};

/**
 * Enhanced fetch with retry logic and error handling
 */
export async function fetchWithRetry(url, options = {}, config = RETRY_CONFIG) {
  let lastError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Check rate limit
      await rateLimiter.checkLimit();

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Validate response
      await validateResponse(response);

      return response;
    } catch (error) {
      lastError = error;

      // Don't retry on validation or auth errors
      if (error.type === ErrorTypes.VALIDATION_ERROR ||
          error.type === ErrorTypes.AUTH_ERROR) {
        throw error;
      }

      // Check if we should retry
      if (attempt < config.maxRetries) {
        const delay = calculateBackoff(attempt, config);
        console.warn(`Request failed, retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt + 1}/${config.maxRetries})`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw lastError || new APIError(
    'Request failed after maximum retries',
    ErrorTypes.NETWORK_ERROR,
    500
  );
}

/**
 * Validate chat input
 */
export function validateChatInput(messages, model) {
  const errors = [];

  // Validate messages
  if (!messages || !Array.isArray(messages)) {
    errors.push('Messages must be an array');
  } else if (messages.length === 0) {
    errors.push('At least one message is required');
  } else {
    messages.forEach((msg, index) => {
      if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
        errors.push(`Message ${index}: Invalid role "${msg.role}"`);
      }
      if (!msg.content || typeof msg.content !== 'string') {
        errors.push(`Message ${index}: Content must be a non-empty string`);
      }
      if (msg.content && msg.content.length > 100000) {
        errors.push(`Message ${index}: Content exceeds maximum length`);
      }
    });
  }

  // Validate model
  if (!model || typeof model !== 'string') {
    errors.push('Model must be specified');
  }

  if (errors.length > 0) {
    throw new APIError(
      'Validation failed',
      ErrorTypes.VALIDATION_ERROR,
      400,
      { errors }
    );
  }

  return true;
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length
  if (sanitized.length > 100000) {
    sanitized = sanitized.substring(0, 100000);
  }

  return sanitized;
}

/**
 * Format error response
 */
export function formatErrorResponse(error) {
  if (error instanceof APIError) {
    return {
      error: true,
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Generic error
  return {
    error: true,
    type: ErrorTypes.NETWORK_ERROR,
    message: error.message || 'An unexpected error occurred',
    statusCode: 500,
  };
}

/**
 * Log error for monitoring
 */
export function logError(error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      type: error.type || 'UNKNOWN',
      stack: error.stack,
    },
    context,
  };

  // In production, send to logging service
  console.error('API Error:', errorLog);

  return errorLog;
}

export default {
  fetchWithRetry,
  validateChatInput,
  sanitizeInput,
  formatErrorResponse,
  logError,
  APIError,
  ErrorTypes,
};