import { useState } from 'react';
import Head from 'next/head';

const ALL_MODELS = [
  { id: 'anthropic/claude-sonnet-4.5', name: 'Sonnet 4.5', provider: 'Anthropic', expectedVersion: '4.5' },
  { id: 'anthropic/claude-haiku-4.5', name: 'Haiku 4.5', provider: 'Anthropic', expectedVersion: '4.5' },
  { id: 'anthropic/claude-opus-4.1', name: 'Opus 4.1', provider: 'Anthropic', expectedVersion: '4.1' },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro', provider: 'Google', expectedVersion: '3' },
  { id: 'google/gemini-3-pro-image', name: 'Gemini 3 Img', provider: 'Google', expectedVersion: '3' },
  { id: 'openai/gpt-5.1-thinking', name: 'GPT-5.1 Think', provider: 'OpenAI', expectedVersion: '5.1' },
  { id: 'openai/gpt-5.1-instant', name: 'GPT-5.1 Inst', provider: 'OpenAI', expectedVersion: '5.1' },
  { id: 'moonshotai/kimi-k2-0905', name: 'Kimi K2', provider: 'Moonshot AI', expectedVersion: 'k2' },
  { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi Think', provider: 'Moonshot AI', expectedVersion: 'k2' },
  { id: 'moonshotai/kimi-k2-thinking-turbo', name: 'Kimi Turbo', provider: 'Moonshot AI', expectedVersion: 'k2' },
  { id: 'perplexity/sonar-pro', name: 'Sonar Pro', provider: 'Perplexity', expectedVersion: 'sonar' },
  { id: 'perplexity/sonar-reasoning-pro', name: 'Sonar Reason', provider: 'Perplexity', expectedVersion: 'sonar' },
  { id: 'xai/grok-4.1-fast-non-reasoning', name: 'Grok 4.1', provider: 'xAI', expectedVersion: '4' },
  { id: 'xai/grok-4.1-fast-reasoning', name: 'Grok Reason', provider: 'xAI', expectedVersion: '4' },
  { id: 'deepseek/deepseek-v3.2-exp-thinking', name: 'DS Think', provider: 'DeepSeek', expectedVersion: '3' },
  { id: 'deepseek/deepseek-v3.2-exp', name: 'DS v3.2', provider: 'DeepSeek', expectedVersion: '3' },
  { id: 'mistral/ministral-3b', name: 'Ministral 3B', provider: 'Mistral', expectedVersion: '3b' },
  { id: 'mistral/mistral-large', name: 'Mistral L', provider: 'Mistral', expectedVersion: 'large' },
  { id: 'alibaba/qwen3-max-preview', name: 'Qwen3 Max', provider: 'Alibaba', expectedVersion: '3' },
];

export default function InternalLab() {
  const [testInput, setTestInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [autoTest, setAutoTest] = useState(true);
  const [testMode, setTestMode] = useState('single');
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  const runValidationTest = async (modelId = 'anthropic/claude-sonnet-4.5') => {
    const validationPrompt = autoTest
      ? 'Please answer these validation questions precisely:\\n1. What is your exact model name and version?\\n2. What is your knowledge cutoff date?\\n3. When were you released/announced?\\n4. What are your key capabilities?\\n\\nPlease be specific and factual in your answers.'
      : testInput;

    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/test-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: validationPrompt,
          model: modelId,
        }),
      });

      const endTime = Date.now();
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Test failed');
      }

      const analysis = analyzeResponse(data.response, modelId);

      return {
        ...data,
        responseTime: endTime - startTime,
        analysis,
        timestamp: new Date().toISOString(),
        success: true,
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false,
        modelRequested: modelId,
      };
    }
  };

  const runSingleTest = async () => {
    setIsLoading(true);
    setResults(null);
    const result = await runValidationTest();
    setResults(result);
    setIsLoading(false);
  };

  const runBulkTest = async () => {
    setIsLoading(true);
    setBulkResults([]);
    setBulkProgress({ current: 0, total: ALL_MODELS.length });

    const results = [];

    for (let i = 0; i < ALL_MODELS.length; i++) {
      const model = ALL_MODELS[i];
      setBulkProgress({ current: i + 1, total: ALL_MODELS.length });
      
      const result = await runValidationTest(model.id);
      results.push({
        ...result,
        modelInfo: model,
      });
      setBulkResults([...results]);

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsLoading(false);
  };

  const analyzeResponse = (responseText, modelId) => {
    const modelInfo = ALL_MODELS.find(m => m.id === modelId);
    const lower = responseText.toLowerCase();
    
    const answers = {
      modelName: extractAnswer(responseText, 1),
      cutoffDate: extractAnswer(responseText, 2),
      releaseDate: extractAnswer(responseText, 3),
      capabilities: extractAnswer(responseText, 4),
    };

    const confidence = {
      modelName: assessModelNameConfidence(answers.modelName, modelInfo, lower),
      cutoffDate: assessCutoffConfidence(answers.cutoffDate, modelInfo, lower),
      releaseDate: assessReleaseConfidence(answers.releaseDate, modelInfo, lower),
      capabilities: assessCapabilitiesConfidence(answers.capabilities, lower),
    };

    return { answers, confidence };
  };

  const extractAnswer = (text, questionNumber) => {
    const lines = text.split('\\n');
    const questionPrefix = questionNumber + '.';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith(questionPrefix)) {
        let answer = line.substring(questionPrefix.length).trim();
        
        if (i + 1 < lines.length && !lines[i + 1].match(/^\\d+\\./)) {
          answer += ' ' + lines[i + 1].trim();
        }
        
        answer = answer.replace(/^\\*\\*.*?\\*\\*/, '').trim();
        
        return answer.substring(0, 200);
      }
    }
    
    return 'No clear answer provided';
  };

  const assessModelNameConfidence = (answer, modelInfo, fullText) => {
    const lower = answer.toLowerCase();
    const fullLower = fullText.toLowerCase();
    
    if (modelInfo.provider === 'Anthropic') {
      if (modelInfo.expectedVersion === '4.5' || modelInfo.expectedVersion === '4.1') {
        if (fullLower.includes('3.5') || fullLower.includes('claude 3')) {
          return 'incorrect';
        }
        if (fullLower.includes('4.5') || fullLower.includes('4.1') || fullLower.includes('sonnet 4') || fullLower.includes('haiku 4') || fullLower.includes('opus 4')) {
          return 'confirmed';
        }
      }
    }
    
    const providerName = modelInfo.provider.toLowerCase();
    if (lower.includes(providerName) || lower.includes(modelInfo.name.toLowerCase())) {
      return 'confirmed';
    }
    
    if (lower.includes('do not have') || lower.includes('cannot') || lower === 'no clear answer provided') {
      return 'estimated';
    }
    
    return 'estimated';
  };

  const assessCutoffConfidence = (answer, modelInfo, fullText) => {
    const lower = fullText.toLowerCase();
    
    if (modelInfo.provider === 'Anthropic') {
      if (lower.includes('april 2024') || lower.includes('2024-04')) {
        return 'incorrect';
      }
      if (lower.includes('2025') || lower.includes('january 2025')) {
        return 'confirmed';
      }
    }
    
    if (answer.match(/20\\d{2}/) || lower.includes('202')) {
      return 'confirmed';
    }
    
    return 'estimated';
  };

  const assessReleaseConfidence = (answer, modelInfo, fullText) => {
    const lower = fullText.toLowerCase();
    
    if (modelInfo.provider === 'Anthropic') {
      if (lower.includes('june 2024') || lower.includes('2024-06')) {
        return 'incorrect';
      }
      if (lower.includes('october 2024') || lower.includes('2024-10')) {
        return 'confirmed';
      }
    }
    
    if (answer.match(/20\\d{2}/)) {
      return 'confirmed';
    }
    
    return 'estimated';
  };

  const assessCapabilitiesConfidence = (answer, fullText) => {
    if (answer.length > 50) {
      return 'confirmed';
    }
    if (answer === 'No clear answer provided') {
      return 'estimated';
    }
    return 'estimated';
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'confirmed':
        return 'bg-green-100 border-green-300';
      case 'incorrect':
        return 'bg-red-100 border-red-300';
      case 'estimated':
      default:
        return 'bg-amber-100 border-amber-300';
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'confirmed':
        return '✅';
      case 'incorrect':
        return '❌';
      case 'estimated':
      default:
        return '🟡';
    }
  };

  const getBulkStats = () => {
    let confirmed = 0;
    let incorrect = 0;
    let estimated = 0;
    let errors = 0;

    bulkResults.forEach(r => {
      if (!r.success) {
        errors++;
      } else if (r.analysis && r.analysis.confidence) {
        const { modelName, cutoffDate, releaseDate } = r.analysis.confidence;
        if (modelName === 'incorrect' || cutoffDate === 'incorrect' || releaseDate === 'incorrect') {
          incorrect++;
        } else if (modelName === 'confirmed' && cutoffDate === 'confirmed') {
          confirmed++;
        } else {
          estimated++;
        }
      }
    });

    return { confirmed, incorrect, estimated, errors, total: bulkResults.length };
  };

  return (
    <>
      <Head>
        <title>Internal Lab - Model Validator</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-7xl mx-auto p-6" style={{maxWidth: '1600px'}}>
          <div className="mb-8 border-b border-gray-300 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🧪 Internal Lab</h1>
                <p className="text-sm text-gray-600 mt-2">AI Gateway Model Validator - Comparative Analysis</p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-yellow-100 border-2 border-yellow-500 rounded-lg px-4 py-2">
                  <div className="text-xs font-bold text-yellow-800">⚠️ INTERNAL USE ONLY</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Test Mode</h2>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setTestMode('single')}
                className={'flex-1 py-3 px-6 rounded-lg font-semibold transition-all ' + (testMode === 'single' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                🎯 Single Model Test
              </button>
              <button
                onClick={() => setTestMode('all')}
                className={'flex-1 py-3 px-6 rounded-lg font-semibold transition-all ' + (testMode === 'all' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                🚀 Test All {ALL_MODELS.length} Models
              </button>
            </div>
          </div>

          {testMode === 'single' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Single Model Test</h2>
              <button
                onClick={runSingleTest}
                disabled={isLoading}
                className={'w-full py-3 px-6 rounded-lg font-semibold transition-all ' + (isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md')}
              >
                {isLoading ? 'Testing...' : '🧪 Test Claude Sonnet 4.5'}
              </button>
            </div>
          )}

          {testMode === 'all' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Bulk Test All Models</h2>
              
              {isLoading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress:</span>
                    <span className="font-semibold">{bulkProgress.current} / {bulkProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full transition-all"
                      style={{ width: (bulkProgress.current / bulkProgress.total) * 100 + '%' }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={runBulkTest}
                disabled={isLoading}
                className={'w-full py-3 px-6 rounded-lg font-semibold transition-all ' + (isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md')}
              >
                {isLoading ? 'Testing ' + bulkProgress.current + '/' + bulkProgress.total + '...' : '🚀 Test All ' + ALL_MODELS.length + ' Models'}
              </button>
            </div>
          )}

          {testMode === 'all' && bulkResults.length > 0 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">📊 Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{getBulkStats().total}</div>
                    <div className="text-xs text-gray-500 mt-1">Total</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-500">
                    <div className="text-2xl font-bold text-green-900">{getBulkStats().confirmed}</div>
                    <div className="text-xs text-green-700 mt-1">✅ Confirmed</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center border-2 border-amber-500">
                    <div className="text-2xl font-bold text-amber-900">{getBulkStats().estimated}</div>
                    <div className="text-xs text-amber-700 mt-1">🟡 Estimated</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center border-2 border-red-500">
                    <div className="text-2xl font-bold text-red-900">{getBulkStats().incorrect}</div>
                    <div className="text-xs text-red-700 mt-1">❌ Incorrect</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center border-2 border-orange-500">
                    <div className="text-2xl font-bold text-orange-900">{getBulkStats().errors}</div>
                    <div className="text-xs text-orange-700 mt-1">🔥 Errors</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
                <h2 className="text-xl font-bold mb-4">📋 Comparative Results Table</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-3 font-semibold bg-gray-50 sticky left-0">Model</th>
                      <th className="text-left p-3 font-semibold bg-gray-50">Model Name &amp; Version</th>
                      <th className="text-left p-3 font-semibold bg-gray-50">Knowledge Cutoff</th>
                      <th className="text-left p-3 font-semibold bg-gray-50">Release Date</th>
                      <th className="text-left p-3 font-semibold bg-gray-50">Capabilities</th>
                      <th className="text-center p-3 font-semibold bg-gray-50">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((result, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 font-medium sticky left-0 bg-white">
                          <div className="text-xs text-gray-500">{result.modelInfo.provider}</div>
                          <div className="font-semibold">{result.modelInfo.name}</div>
                        </td>
                        {result.error ? (
                          <td colSpan="5" className="p-3 text-red-600 font-mono text-xs">
                            Error: {result.error}
                          </td>
                        ) : (
                          <>
                            <td className={'p-3 border-l border-gray-200 ' + getConfidenceColor(result.analysis && result.analysis.confidence.modelName)}>
                              <div className="flex items-start">
                                <span className="mr-2">{getConfidenceIcon(result.analysis && result.analysis.confidence.modelName)}</span>
                                <span className="text-xs">{result.analysis && result.analysis.answers.modelName}</span>
                              </div>
                            </td>
                            <td className={'p-3 border-l border-gray-200 ' + getConfidenceColor(result.analysis && result.analysis.confidence.cutoffDate)}>
                              <div className="flex items-start">
                                <span className="mr-2">{getConfidenceIcon(result.analysis && result.analysis.confidence.cutoffDate)}</span>
                                <span className="text-xs">{result.analysis && result.analysis.answers.cutoffDate}</span>
                              </div>
                            </td>
                            <td className={'p-3 border-l border-gray-200 ' + getConfidenceColor(result.analysis && result.analysis.confidence.releaseDate)}>
                              <div className="flex items-start">
                                <span className="mr-2">{getConfidenceIcon(result.analysis && result.analysis.confidence.releaseDate)}</span>
                                <span className="text-xs">{result.analysis && result.analysis.answers.releaseDate}</span>
                              </div>
                            </td>
                            <td className={'p-3 border-l border-gray-200 ' + getConfidenceColor(result.analysis && result.analysis.confidence.capabilities)}>
                              <div className="flex items-start">
                                <span className="mr-2">{getConfidenceIcon(result.analysis && result.analysis.confidence.capabilities)}</span>
                                <span className="text-xs" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{result.analysis && result.analysis.answers.capabilities}</span>
                              </div>
                            </td>
                            <td className="p-3 border-l border-gray-200 text-center text-xs text-gray-500">
                              {result.responseTime}ms
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                <strong>Legend:</strong>
                <ul className="mt-2 space-y-1">
                  <li>✅ <strong>Confirmed (Green):</strong> Model explicitly confirms expected information</li>
                  <li>🟡 <strong>Estimated (Amber):</strong> Reasonable to assume correct, but not explicitly confirmed</li>
                  <li>❌ <strong>Incorrect (Red):</strong> Model confirms it is NOT the requested version (misrouting detected)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
