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
        <title>Brain Co-Lab - Multi AI Chat</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <header className="glass border-b border-gray-200/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="animate-fade-in">
                <h1 className="text-2xl font-bold">
                  <span className="text-3xl">🧠</span>
                  <span className="ml-2 gradient-text">Brain Co-Lab</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  Multi-AI Interface
                  {isStreaming && (
                    <span className="flex items-center gap-1 text-blue-600 animate-pulse">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Streaming...
                    </span>
                  )}
                </p>
              </div>

              {/* Credits Display */}
              <div className="card px-5 py-3 animate-fade-in delay-200">
                <div className="text-xs text-gray-500 font-medium">AI Gateway Balance</div>
                <div className="text-xl font-bold gradient-text mt-1">
                  ${typeof credits === 'number' ? credits.toFixed(2) : '0.00'}
                </div>
                {totalCost > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Session: <span className="text-red-600 font-semibold">-${totalCost.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Model Selector */}
          <div className="mb-6 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Select AI Model
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {AI_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                const providerColor = getProviderColor(model.provider);

                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    disabled={isLoading}
                    className={`model-btn group ${isSelected ? `model-btn-selected ${providerColor}` : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-xs font-medium text-gray-500 mb-1">{model.provider}</div>
                    <div className="text-sm font-bold text-gray-900">{model.name}</div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center justify-between">
                      <span>${model.inputPrice}</span>
                      <span className="text-gray-300">/</span>
                      <span>${model.outputPrice}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages Area */}
            <div className="lg:col-span-2">
              <div className="card h-[calc(100vh-340px)] min-h-[500px] overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center animate-fade-in">
                        <div className="text-6xl mb-6">💬</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Start a conversation
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                          Select an AI model above and type your message below to begin
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message, index) => {
                        const isUser = message.role === 'user';
                        const messageModel = message.model ? getModelById(message.model) : null;

                        return (
                          <div
                            key={index}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={isUser ? 'message-user' : message.isError ? 'message-error' : 'message-assistant'}>
                              {message.role === 'assistant' && messageModel && !message.isError && (
                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-700">
                                      {messageModel.name}
                                    </span>
                                    {message.isStreaming && (
                                      <span className="flex items-center gap-1 text-blue-600 text-xs">
                                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                                        Streaming
                                      </span>
                                    )}
                                  </div>
                                  {message.cost !== undefined && (
                                    <span className="text-xs text-gray-400">
                                      ${message.cost.toFixed(6)}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                                {message.isStreaming && (
                                  <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"></span>
                                )}
                              </div>
                              {message.tokens && (
                                <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                                  {message.tokens.input} in / {message.tokens.output} out
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-28">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
                  Your Message
                </h3>

                <div className="relative mb-4">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message or use voice..."
                    className="input-primary resize-none"
                    rows="8"
                    disabled={isLoading}
                  />
                  {isListening && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 glass-dark px-3 py-1.5 rounded-full animate-pulse">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-white font-medium">Listening...</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-6">
                  <button
                    onClick={toggleRecording}
                    disabled={isLoading}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isRecording
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    className="btn-primary flex-1"
                  >
                    {isStreaming ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Streaming...
                      </span>
                    ) : isLoading ? (
                      'Sending...'
                    ) : (
                      'Send Message'
                    )}
                  </button>

                  <button
                    onClick={clearChat}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
                  >
                    Clear
                  </button>
                </div>

                {/* Current Model Info */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">
                    Current Model
                  </div>
                  <div className="card bg-gradient-to-br from-gray-50 to-white p-4">
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      {currentModel?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Provider:</span>
                        <span className="font-semibold">{currentModel?.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Input:</span>
                        <span className="font-semibold">${currentModel?.inputPrice || 0}/1K</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Output:</span>
                        <span className="font-semibold">${currentModel?.outputPrice || 0}/1K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
