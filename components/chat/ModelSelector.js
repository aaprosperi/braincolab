import Badge from '../ui/Badge';

const ModelSelector = ({ models, selectedModel, onSelectModel, disabled = false }) => {
  const getProviderColor = (provider) => {
    const colors = {
      'OpenAI': 'border-emerald-200 bg-emerald-50 hover:border-emerald-400',
      'Anthropic': 'border-orange-200 bg-orange-50 hover:border-orange-400',
      'Google': 'border-blue-200 bg-blue-50 hover:border-blue-400',
      'Meta': 'border-violet-200 bg-violet-50 hover:border-violet-400',
      'Mistral': 'border-rose-200 bg-rose-50 hover:border-rose-400',
      'xAI': 'border-gray-200 bg-gray-50 hover:border-gray-400',
      'Perplexity': 'border-cyan-200 bg-cyan-50 hover:border-cyan-400',
      'DeepSeek': 'border-indigo-200 bg-indigo-50 hover:border-indigo-400',
    };
    return colors[provider] || 'border-gray-200 bg-gray-50 hover:border-gray-400';
  };

  const getProviderBadgeVariant = (provider) => {
    const variants = {
      'OpenAI': 'success',
      'Anthropic': 'warning',
      'Google': 'primary',
      'Meta': 'purple',
      'Mistral': 'danger',
      'xAI': 'default',
      'Perplexity': 'primary',
      'DeepSeek': 'purple',
    };
    return variants[provider] || 'default';
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Selecciona un modelo de IA
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {models.map((model) => {
          const isSelected = selectedModel === model.id;
          return (
            <button
              key={model.id}
              onClick={() => onSelectModel(model.id)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                  : getProviderColor(model.provider)
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <Badge
                  variant={getProviderBadgeVariant(model.provider)}
                  size="sm"
                >
                  {model.provider}
                </Badge>
                {isSelected && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                {model.name}
              </h4>
              <div className="flex items-baseline space-x-2 text-xs text-gray-600">
                <span className="font-medium">Input:</span>
                <span>${model.inputPrice.toFixed(3)}/1K</span>
              </div>
              <div className="flex items-baseline space-x-2 text-xs text-gray-600">
                <span className="font-medium">Output:</span>
                <span>${model.outputPrice.toFixed(3)}/1K</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModelSelector;
