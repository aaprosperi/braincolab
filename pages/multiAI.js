import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { AI_MODELS, SPEECH_CONFIG } from '../utils/constants';
import { estimateTokens, calculateCost, getModelById, getProviderColor } from '../utils/aiHelpers';
import { ERROR_MESSAGES } from '../utils/config';

export default function MultiAIChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize on mount
  useEffect(() => {
    fetchCredits();
    initializeSpeechRecognition();
  }, []);

  // Memoized model lookup
  const currentModel = useMemo(() => {
    return getModelById(selectedModel);
  }, [selectedModel]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = SPEECH_CONFIG.continuous;
        recognition.interimResults = SPEECH_CONFIG.interimResults;
        recognition.lang = SPEECH_CONFIG.lang;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            }
          }

          if (finalTranscript) {
            setInputMessage(prev => prev + finalTranscript);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (isRecording) {
            recognition.start();
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) {
      alert(ERROR_MESSAGES.SPEECH_NOT_SUPPORTED);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }, [isRecording]);

  const fetchCredits = useCallback(async () => {
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
  }, []);

  const handleSendMessage = useCallback(async () => {
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

    // Create placeholder message for streaming
    const assistantMessageIndex = updatedMessages.length;
    const assistantMessage = {
      role: 'assistant',
      content: '',
      model: selectedModel,
      timestamp: new Date().toISOString(),
      isStreaming: true
    };
    setMessages([...updatedMessages, assistantMessage]);

    // Create AbortController for cancellation
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

      // Process stream
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

                // Update message in real-time
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

      // Calculate costs after streaming
      const inputTokens = estimateTokens(updatedMessages.map(m => m.content).join(' '));
      const outputTokens = estimateTokens(fullContent);
      const cost = calculateCost(inputTokens, outputTokens, selectedModel);

      // Update with final costs
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
  }, [inputMessage, isLoading, messages, selectedModel, fetchCredits]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setTotalCost(0);
  }, []);

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
              {AI_MODELS.map((model) => {
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
                      const messageModel = message.model ? getModelById(message.model) : null;

                      return (
                        <div
                          key={index}
                          className={'flex ' + (isUser ? 'justify-end' : 'justify-start')}
                        >
                          <div className={'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ' + messageClass}>
                            {message.role === 'assistant' && messageModel && !message.isError && (
                              <div className="text-xs text-gray-500 mb-1">
                                {messageModel.name}
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
                <div className="relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message or use voice..."
                    className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-400 resize-none"
                    rows="8"
                    disabled={isLoading}
                  />
                  {isListening && (
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-500 font-medium">Escuchando...</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={toggleRecording}
                    disabled={isLoading}
                    className={'px-4 py-2 rounded-lg font-medium transition-all ' +
                      (isRecording
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                    }
                    title={isRecording ? 'Stop recording' : 'Start voice input'}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
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
                      {currentModel?.name || 'Unknown'}
                    </div>
                    <div className="text-gray-400 mt-1">
                      Input: ${currentModel?.inputPrice || 0}/1K
                    </div>
                    <div className="text-gray-400">
                      Output: ${currentModel?.outputPrice || 0}/1K
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
