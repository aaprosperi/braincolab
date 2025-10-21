import { AI_MODELS, CHARS_PER_TOKEN, PROVIDER_COLORS, DEFAULT_PROVIDER_COLOR } from './constants';

/**
 * Estimate the number of tokens in a text string
 * @param {string} text - The text to estimate tokens for
 * @returns {number} Estimated token count
 */
export const estimateTokens = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
};

/**
 * Calculate the cost of a request based on input/output tokens and model
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @param {string} modelId - The model ID
 * @returns {number} Total cost in USD
 */
export const calculateCost = (inputTokens, outputTokens, modelId) => {
  const modelInfo = AI_MODELS.find(m => m.id === modelId);
  if (!modelInfo) return 0;

  const inputCost = (inputTokens / 1000) * modelInfo.inputPrice;
  const outputCost = (outputTokens / 1000) * modelInfo.outputPrice;
  return inputCost + outputCost;
};

/**
 * Get the model information by ID
 * @param {string} modelId - The model ID
 * @returns {object|null} Model information object or null if not found
 */
export const getModelById = (modelId) => {
  return AI_MODELS.find(m => m.id === modelId) || null;
};

/**
 * Get the CSS classes for a provider's color scheme
 * @param {string} provider - The provider name
 * @returns {string} Tailwind CSS classes
 */
export const getProviderColor = (provider) => {
  return PROVIDER_COLORS[provider] || DEFAULT_PROVIDER_COLOR;
};

/**
 * Create a memoized model lookup map for O(1) access
 * @returns {Map} Map of model IDs to model objects
 */
export const createModelMap = () => {
  const map = new Map();
  AI_MODELS.forEach(model => {
    map.set(model.id, model);
  });
  return map;
};
