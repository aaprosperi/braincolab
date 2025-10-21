// AI Models configuration
export const AI_MODELS = [
  // OpenAI
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5', provider: 'OpenAI', inputPrice: 0.0005, outputPrice: 0.0015 },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', inputPrice: 0.03, outputPrice: 0.06 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', inputPrice: 0.0025, outputPrice: 0.01 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', inputPrice: 0.00015, outputPrice: 0.0006 },
  // Anthropic
  { id: 'anthropic/claude-3-haiku-20240307', name: 'Haiku', provider: 'Anthropic', inputPrice: 0.00025, outputPrice: 0.00125 },
  { id: 'anthropic/claude-sonnet-4.5', name: 'Sonnet 4.5', provider: 'Anthropic', inputPrice: 0.003, outputPrice: 0.015 },
  { id: 'anthropic/claude-opus-4.1', name: 'Opus 4.1', provider: 'Anthropic', inputPrice: 0.015, outputPrice: 0.075 },
  // Google
  { id: 'google/gemini-1.5-flash', name: 'Gemini Flash', provider: 'Google', inputPrice: 0.000075, outputPrice: 0.0003 },
  { id: 'google/gemini-1.5-pro', name: 'Gemini Pro', provider: 'Google', inputPrice: 0.00125, outputPrice: 0.005 },
  { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0', provider: 'Google', inputPrice: 0, outputPrice: 0 },
  // Meta
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3', provider: 'Meta', inputPrice: 0.00018, outputPrice: 0.00018 },
  // Mistral
  { id: 'mistral/mistral-large-latest', name: 'Mistral L', provider: 'Mistral', inputPrice: 0.002, outputPrice: 0.006 },
  { id: 'mistral/mistral-small-latest', name: 'Mistral S', provider: 'Mistral', inputPrice: 0.0002, outputPrice: 0.0006 },
  // xAI
  { id: 'xai/grok-2-1212', name: 'Grok 2', provider: 'xAI', inputPrice: 0.002, outputPrice: 0.01 },
  // DeepSeek
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek', provider: 'DeepSeek', inputPrice: 0.00014, outputPrice: 0.00028 },
  // Perplexity
  { id: 'perplexity/llama-3.1-sonar-small-128k-online', name: 'Sonar S', provider: 'Perplexity', inputPrice: 0.0002, outputPrice: 0.0002 },
  { id: 'perplexity/llama-3.1-sonar-large-128k-online', name: 'Sonar L', provider: 'Perplexity', inputPrice: 0.001, outputPrice: 0.001 },
];

// Provider color mapping
export const PROVIDER_COLORS = {
  'OpenAI': 'border-emerald-500 bg-emerald-50 text-emerald-700',
  'Anthropic': 'border-orange-500 bg-orange-50 text-orange-700',
  'Google': 'border-blue-500 bg-blue-50 text-blue-700',
  'Meta': 'border-violet-500 bg-violet-50 text-violet-700',
  'Mistral': 'border-rose-500 bg-rose-50 text-rose-700',
  'xAI': 'border-gray-500 bg-gray-50 text-gray-700',
  'Perplexity': 'border-cyan-500 bg-cyan-50 text-cyan-700',
  'DeepSeek': 'border-indigo-500 bg-indigo-50 text-indigo-700'
};

// Default color for unknown providers
export const DEFAULT_PROVIDER_COLOR = 'border-gray-500 bg-gray-50 text-gray-700';

// Token estimation constant
export const CHARS_PER_TOKEN = 4;

// Landing page constants
export const LANDING_FEATURES = [
  {
    icon: '🤖',
    title: 'Multi-AI Models',
    description: '17+ AI models from OpenAI, Anthropic, Google, Meta and more'
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Powered by Vercel Edge Functions for instant responses'
  },
  {
    icon: '💰',
    title: 'Cost Tracking',
    description: 'Real-time usage monitoring and cost analysis per model'
  },
  {
    icon: '🔐',
    title: 'Secure',
    description: 'Your API keys are safely managed through Vercel'
  }
];

export const FEATURED_MODELS = [
  'GPT-4', 'Claude 3', 'Gemini Pro', 'Llama 3.3',
  'Mistral', 'Grok', 'DeepSeek', 'Perplexity'
];

// Speech recognition configuration
export const SPEECH_CONFIG = {
  lang: 'es-ES',
  continuous: true,
  interimResults: true
};
