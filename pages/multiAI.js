import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function MultiAIChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const models = [
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

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits(0);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const estimateTokens = (text) => {
    return Math.ceil(text.length / 4);
  };

  const calculateCost = (inputTokens, outputTokens, model) => {
    const modelInfo = models.find(m => m.id === model);
    if (!modelInfo) return 0;
    
    const inputCost = (inputTokens / 1000) * modelInfo.inputPrice;
    const outputCost = (outputTokens / 1000) * modelInfo.outputPrice;
    return inputCost + outputCost;
  };

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
    setIsStreaming(true);

    // Crear mensaje placeholder para el streaming
    const assistantMessageIndex = updatedMessages.length;
    const assistantMessage = {
      role: 'assistant',
      content: '',
      model: selectedModel,
      timestamp: new Date().toISOString(),
      isStreaming: true
    };
    setMessages([...updatedMessages, assistantMessage]);

    // Crear AbortController para cancelación
    abortControllerRef.current = new AbortController();

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
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Error: ' + response.status);
      }

      // Procesar el stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                
                // Actualizar mensaje en tiempo real
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[assistantMessageIndex] = {
                    ...newMessages[assistantMessageIndex],
                    content: fullContent
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

      // Calcular costos después del streaming
      const inputTokens = estimateTokens(updatedMessages.map(m => m.content).join(' '));
      const outputTokens = estimateTokens(fullContent);
      const cost = calculateCost(inputTokens, outputTokens, selectedModel);

      // Actualizar con costos finales
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[assistantMessageIndex] = {
          ...newMessages[assistantMessageIndex],
          isStreaming: false,
          cost: cost,
          tokens: { input: inputTokens, output: outputTokens }
        };
        return newMessages;
      });

      setTotalCost(prevCost => prevCost + cost);
      fetchCredits();
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream cancelled by user');
      } else {
        console.error('Error:', error);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = {
            role: 'assistant',
            content: 'Error: ' + error.message,
            model: selectedModel,
            timestamp: new Date().toISOString(),
            isError: true
          };
          return newMessages;
        });
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
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
    setTotalCost(0);
  };

  const getProviderColor = (provider) => {
    const colors = {
      'OpenAI': 'border-emerald-500 bg-emerald-50 text-emerald-700',
      'Anthropic': 'border-orange-500 bg-orange-50 text-orange-700',
      'Google': 'border-blue-500 bg-blue-50 text-blue-700',
      'Meta': 'border-violet-500 bg-violet-50 text-violet-700',
      'Mistral': 'border-rose-500 bg-rose-50 text-rose-700',
      'xAI': 'border-gray-500 bg-gray-50 text-gray-700',
      'Perplexity': 'border-cyan-500 bg-cyan-50 text-cyan-700',
      'DeepSeek': 'border-indigo-500 bg-indigo-50 text-indigo-700'
    };
    return colors[provider] || 'border-gray-500 bg-gray-50 text-gray-700';
  };

  return (
    <>
      <Head>
        <title>Brain Co-Lab - Multi AI</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="min-h-screen bg-white text-gray-900">
        <div className="max-w-7xl mx-auto p-4">
          <div className="mb-6 flex justify-between items-start border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-2xl font-light">Brain Co-Lab</h1>
              <p className="text-sm text-gray-500 mt-1">Multi-AI Interface {isStreaming && '• Streaming...'}</p>
            </div>
            <div className="text-right">
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <div className="text-xs text-gray-500">AI Gateway Balance</div>
                <div className="text-lg font-semibold">
                  ${typeof credits === 'number' ? credits.toFixed(2) : '0.00'}
                </div>
                {totalCost > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Session: -${totalCost.toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {models.map((model) => {
                const isSelected = selectedModel === model.id;
                const colorClass = isSelected ? getProviderColor(model.provider) : 'border-gray-200 hover:border-gray-300 bg-white';
                
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    disabled={isLoading}
                    className={'p-3 rounded-lg border-2 transition-all ' + colorClass + (isLoading ? ' opacity-50 cursor-not-allowed' : '')}
                  >
                    <div className="text-xs font-medium text-gray-500">{model.provider}</div>
                    <div className="text-sm font-semibold">{model.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      ${model.inputPrice}/${model.outputPrice}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="h-96 lg:h-[500px] overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-3">🤖</div>
                      <p className="font-light">Select a model and start chatting</p>
                      <p className="text-xs mt-2">Now with real-time streaming!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isUser = message.role === 'user';
                      const messageClass = isUser
                        ? 'bg-gray-900 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-white border border-gray-200';
                      
                      return (
                        <div
                          key={index}
                          className={'flex ' + (isUser ? 'justify-end' : 'justify-start')}
                        >
                          <div className={'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ' + messageClass}>
                            {message.role === 'assistant' && message.model && !message.isError && (
                              <div className="text-xs text-gray-500 mb-1">
                                {models.find(m => m.id === message.model)?.name || message.model}
                                {message.isStreaming && ' • Streaming...'}
                                {message.cost !== undefined && (
                                  <span className="ml-2 text-gray-400">
                                    Cost: ${message.cost.toFixed(6)} 
                                    ({message.tokens?.input}/{message.tokens?.output} tokens)
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                              {message.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse"></span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-400 resize-none"
                  rows="8"
                  disabled={isLoading}
                />
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className={'flex-1 py-2 px-4 rounded-lg font-medium transition-colors ' + 
                      (isLoading || !inputMessage.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800')
                    }
                  >
                    {isStreaming ? 'Streaming...' : isLoading ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    onClick={clearChat}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <div>Current Model:</div>
                    <div className="text-gray-900 font-medium mt-1">
                      {models.find(m => m.id === selectedModel)?.name}
                    </div>
                    <div className="text-gray-400 mt-1">
                      Input: ${models.find(m => m.id === selectedModel)?.inputPrice}/1K
                    </div>
                    <div className="text-gray-400">
                      Output: ${models.find(m => m.id === selectedModel)?.outputPrice}/1K
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </>
  );
}