import { useState, useRef, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ModelSelector from '../components/chat/ModelSelector';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';

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

  // Inicialización
  useEffect(() => {
    fetchCredits();
    initializeSpeechRecognition();
  }, []);

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const initializeSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      if (isRecording) recognition.start();
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
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

    recognitionRef.current = recognition;
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('El reconocimiento de voz no está soportado en este navegador. Por favor usa Chrome o Edge.');
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
  };

  const estimateTokens = (text) => Math.ceil(text.length / 4);

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

    const assistantMessageIndex = updatedMessages.length;
    const assistantMessage = {
      role: 'assistant',
      content: '',
      model: models.find(m => m.id === selectedModel)?.name || selectedModel,
      timestamp: new Date().toISOString(),
      isStreaming: true
    };
    setMessages([...updatedMessages, assistantMessage]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel,
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Error: ' + response.status);

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
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
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

      const inputTokens = estimateTokens(updatedMessages.map(m => m.content).join(' '));
      const outputTokens = estimateTokens(fullContent);
      const cost = calculateCost(inputTokens, outputTokens, selectedModel);

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
      if (error.name !== 'AbortError') {
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

  const clearChat = () => {
    setMessages([]);
    setTotalCost(0);
  };

  const selectedModelInfo = models.find(m => m.id === selectedModel);

  return (
    <>
      <Head>
        <title>BrainColab - Chat Multi-IA en Tiempo Real</title>
        <meta name="description" content="Chatea con múltiples modelos de IA. Streaming en tiempo real, entrada de voz y seguimiento de costos." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white">
        <Navigation />

        <div className="pt-20">
          <Container size="lg">
            {/* Header */}
            <div className="py-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Chat Multi-IA
                  </h1>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge variant={isStreaming ? 'success' : 'default'}>
                      {isStreaming ? '🔴 Streaming' : '⚪ Listo'}
                    </Badge>
                    {selectedModelInfo && (
                      <Badge variant="primary">
                        {selectedModelInfo.provider} {selectedModelInfo.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <Card padding="sm" className="w-full sm:w-auto">
                  <div className="text-center sm:text-right">
                    <div className="text-xs text-gray-500 mb-1">
                      Saldo Gateway
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${typeof credits === 'number' ? credits.toFixed(2) : '0.00'}
                    </div>
                    {totalCost > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Sesión: -${totalCost.toFixed(4)}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Model Selector */}
            <div className="py-6 border-b border-gray-200">
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                disabled={isLoading}
              />
            </div>

            {/* Chat Area */}
            <div className="py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages Panel */}
                <div className="lg:col-span-2">
                  <Card padding="none" className="h-[600px] flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-4xl">
                              🤖
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              Bienvenido a BrainColab
                            </h3>
                            <p className="text-gray-600 mb-1">
                              Selecciona un modelo y comienza a chatear
                            </p>
                            <p className="text-sm text-gray-500">
                              ✨ Streaming en tiempo real • 🎤 Entrada de voz • 💰 Seguimiento de costos
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {messages.map((message, index) => (
                            <ChatMessage key={index} message={message} />
                          ))}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Input Panel */}
                <div className="lg:col-span-1">
                  <div className="space-y-4">
                    {/* Chat Input Component */}
                    <Card padding="md">
                      <ChatInput
                        value={inputMessage}
                        onChange={setInputMessage}
                        onSubmit={handleSendMessage}
                        onVoiceInput={toggleRecording}
                        disabled={isLoading}
                        loading={isLoading}
                        listening={isListening}
                      />

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearChat}
                          className="w-full"
                          disabled={messages.length === 0}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Limpiar Chat
                        </Button>
                      </div>
                    </Card>

                    {/* Model Info */}
                    {selectedModelInfo && (
                      <Card padding="md">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Información del Modelo
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Proveedor:</span>
                            <span className="font-medium text-gray-900">
                              {selectedModelInfo.provider}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Modelo:</span>
                            <span className="font-medium text-gray-900">
                              {selectedModelInfo.name}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Input:</span>
                              <span className="font-mono text-xs text-gray-900">
                                ${selectedModelInfo.inputPrice.toFixed(4)}/1K
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-gray-600">Output:</span>
                              <span className="font-mono text-xs text-gray-900">
                                ${selectedModelInfo.outputPrice.toFixed(4)}/1K
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Quick Tips */}
                    <Card padding="md" className="bg-blue-50 border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">
                        💡 Consejos Rápidos
                      </h3>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Enter para enviar</li>
                        <li>• Shift + Enter para nueva línea</li>
                        <li>• Click en 🎤 para entrada de voz</li>
                        <li>• Los costos se calculan automáticamente</li>
                      </ul>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
