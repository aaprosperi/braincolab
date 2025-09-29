import { useState, useRef, useEffect } from 'react';

export default function MultiAIChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const models = [
    // OpenAI
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5', provider: 'OpenAI', price: '$0.50/$1.50' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', price: '$30/$60' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', price: '$2.50/$10' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', price: '$0.15/$0.60' },
    // Anthropic
    { id: 'anthropic/claude-3-haiku-20240307', name: 'Haiku', provider: 'Anthropic', price: '$0.25/$1.25' },
    { id: 'anthropic/claude-3-5-sonnet-20241022', name: 'Sonnet 3.5', provider: 'Anthropic', price: '$3/$15' },
    { id: 'anthropic/claude-3-opus-20240229', name: 'Opus', provider: 'Anthropic', price: '$15/$75' },
    // Google
    { id: 'google/gemini-1.5-flash', name: 'Gemini Flash', provider: 'Google', price: '$0.075/$0.30' },
    { id: 'google/gemini-1.5-pro', name: 'Gemini Pro', provider: 'Google', price: '$1.25/$5' },
    { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0', provider: 'Google', price: 'Free' },
    // Meta
    { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3', provider: 'Meta', price: '$0.18/$0.18' },
    // Mistral
    { id: 'mistral/mistral-large-latest', name: 'Mistral L', provider: 'Mistral', price: '$2/$6' },
    { id: 'mistral/mistral-small-latest', name: 'Mistral S', provider: 'Mistral', price: '$0.20/$0.60' },
    // xAI
    { id: 'xai/grok-2-1212', name: 'Grok 2', provider: 'xAI', price: '$2/$10' },
    // DeepSeek
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek', provider: 'DeepSeek', price: '$0.14/$0.28' },
    // Perplexity
    { id: 'perplexity/llama-3.1-sonar-small-128k-online', name: 'Sonar S', provider: 'Perplexity', price: '$0.20/$0.20' },
    { id: 'perplexity/llama-3.1-sonar-large-128k-online', name: 'Sonar L', provider: 'Perplexity', price: '$1/$1' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.message,
        model: selectedModel,
        timestamp: new Date().toISOString()
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        model: selectedModel,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getProviderStyles = (provider) => {
    const styles = {
      'OpenAI': 'bg-emerald-500 hover:bg-emerald-600',
      'Anthropic': 'bg-amber-500 hover:bg-amber-600',
      'Google': 'bg-blue-500 hover:bg-blue-600',
      'Meta': 'bg-violet-500 hover:bg-violet-600',
      'Mistral': 'bg-rose-500 hover:bg-rose-600',
      'xAI': 'bg-slate-600 hover:bg-slate-700',
      'Perplexity': 'bg-cyan-500 hover:bg-cyan-600',
      'DeepSeek': 'bg-indigo-500 hover:bg-indigo-600'
    };
    return styles[provider] || 'bg-gray-500 hover:bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6 border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-light">Brain Co-Lab</h1>
          <p className="text-sm text-gray-400 mt-1">Multi-AI Interface • 17 Models</p>
        </div>

        {/* Model Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`relative group transition-all duration-200 ${
                  selectedModel === model.id
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                    : ''
                }`}
              >
                <div className={`p-3 rounded-lg ${getProviderStyles(model.provider)} ${
                  selectedModel === model.id ? 'opacity-100' : 'opacity-80'
                }`}>
                  <div className="text-xs font-medium opacity-80">{model.provider}</div>
                  <div className="text-sm font-bold">{model.name}</div>
                  <div className="text-xs opacity-60 mt-1">{model.price}/M</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Messages Area */}
          <div className="lg:col-span-2 bg-gray-950 rounded-lg border border-gray-800">
            <div className="h-[500px] overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🤖</div>
                    <p>Select a model and start chatting</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-white text-black'
                          : message.isError
                          ? 'bg-red-900 text-red-100'
                          : 'bg-gray-800 text-gray-100'
                      }`}>
                        {message.role === 'assistant' && message.model && (
                          <div className="text-xs opacity-60 mb-1">
                            {models.find(m => m.id === message.model)?.name || message.model}
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="lg:col-span-1">
            <div className="bg-gray-950 rounded-lg border border-gray-800 p-4">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500 resize-none"
                rows="8"
                disabled={isLoading}
              />
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isLoading || !inputMessage.trim()
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
                <button
                  onClick={clearChat}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-900 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-500">
                  <div>Current Model:</div>
                  <div className="text-white font-medium mt-1">
                    {models.find(m => m.id === selectedModel)?.name}
                  </div>
                  <div className="text-gray-400 mt-1">
                    {models.find(m => m.id === selectedModel)?.price}/M tokens
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}