import { useState, useRef, useEffect } from 'react';

export default function MultiAIChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const models = [
    // OpenAI
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', price: 'Input: $0.50/M • Output: $1.50/M' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', price: 'Input: $30.00/M • Output: $60.00/M' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', price: 'Input: $2.50/M • Output: $10.00/M' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', price: 'Input: $0.15/M • Output: $0.60/M' },
    // Anthropic
    { id: 'anthropic/claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'Anthropic', price: 'Input: $0.25/M • Output: $1.25/M' },
    { id: 'anthropic/claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', price: 'Input: $3.00/M • Output: $15.00/M' },
    { id: 'anthropic/claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic', price: 'Input: $15.00/M • Output: $75.00/M' },
    // Google
    { id: 'google/gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', price: 'Input: $0.075/M • Output: $0.30/M' },
    { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', price: 'Input: $1.25/M • Output: $5.00/M' },
    { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'Google', price: 'Gratis (experimental)' },
    // Meta
    { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', price: 'Input: $0.18/M • Output: $0.18/M' },
    // Mistral
    { id: 'mistral/mistral-large-latest', name: 'Mistral Large', provider: 'Mistral', price: 'Input: $2.00/M • Output: $6.00/M' },
    { id: 'mistral/mistral-small-latest', name: 'Mistral Small', provider: 'Mistral', price: 'Input: $0.20/M • Output: $0.60/M' },
    // xAI
    { id: 'xai/grok-2-1212', name: 'Grok 2', provider: 'xAI', price: 'Input: $2.00/M • Output: $10.00/M' },
    // DeepSeek
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', price: 'Input: $0.14/M • Output: $0.28/M' },
    // Perplexity
    { id: 'perplexity/llama-3.1-sonar-small-128k-online', name: 'Sonar Small (Online)', provider: 'Perplexity', price: 'Input: $0.20/M • Output: $0.20/M' },
    { id: 'perplexity/llama-3.1-sonar-large-128k-online', name: 'Sonar Large (Online)', provider: 'Perplexity', price: 'Input: $1.00/M • Output: $1.00/M' },
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

  const getModelBadgeColor = (provider) => {
    switch(provider) {
      case 'OpenAI': return 'bg-green-100 text-green-800';
      case 'Anthropic': return 'bg-orange-100 text-orange-800';
      case 'Google': return 'bg-blue-100 text-blue-800';
      case 'Meta': return 'bg-purple-100 text-purple-800';
      case 'Mistral': return 'bg-pink-100 text-pink-800';
      case 'xAI': return 'bg-gray-100 text-gray-800';
      case 'Perplexity': return 'bg-cyan-100 text-cyan-800';
      case 'DeepSeek': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Brain Co-Lab: Multi-AI Chat</h1>
          <p className="text-gray-600">Chat con 17 modelos verificados • Precios por millón de tokens</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 max-h-96 overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona el modelo de IA:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedModel === model.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium text-gray-900">{model.name}</div>
                <div className={`inline-block px-2 py-1 mt-1 text-xs rounded-full ${getModelBadgeColor(model.provider)}`}>
                  {model.provider}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {model.price}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Inicia una conversación con cualquier modelo</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.isError
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' && message.model && (
                      <div className="text-xs opacity-75 mb-1">
                        {models.find(m => m.id === message.model)?.name || message.model}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    <div className="text-xs opacity-60 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              disabled={isLoading}
            />
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isLoading || !inputMessage.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
              </button>
              <button
                onClick={clearChat}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}