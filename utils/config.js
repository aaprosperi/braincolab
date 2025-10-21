// API Configuration
export const API_CONFIG = {
  // Vercel AI Gateway endpoint
  GATEWAY_URL: 'https://ai-gateway.vercel.sh/v1/chat/completions',

  // Default chat parameters
  DEFAULT_MAX_TOKENS: 1000,
  DEFAULT_TEMPERATURE: 0.7,

  // Stream timeout (30 seconds)
  STREAM_TIMEOUT: 30000,

  // Credits API configuration
  DEFAULT_CREDITS: 4.99,
  CREDITS_CURRENCY: 'USD',
};

// Error messages
export const ERROR_MESSAGES = {
  NO_API_KEY: 'AI Gateway API key not configured. Please add AI_GATEWAY_API_KEY to your environment variables in Vercel.',
  INVALID_API_KEY: 'Invalid API key. Please check your AI_GATEWAY_API_KEY in Vercel environment variables.',
  MISSING_PARAMS: 'Missing messages or model',
  GATEWAY_ERROR: 'AI Gateway error',
  STREAM_TIMEOUT: 'Stream timeout - request took too long',
  SPEECH_NOT_SUPPORTED: 'Speech recognition is not supported in this browser. Please use Chrome or Edge.',
};
