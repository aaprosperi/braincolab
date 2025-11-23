import { useState } from 'react';
import Head from 'next/head';

// Import models list from multiAI
const ALL_MODELS = [
  { id: 'anthropic/claude-sonnet-4.5', name: 'Sonnet 4.5', provider: 'Anthropic' },
  { id: 'anthropic/claude-haiku-4.5', name: 'Haiku 4.5', provider: 'Anthropic' },
  { id: 'anthropic/claude-opus-4.1', name: 'Opus 4.1', provider: 'Anthropic' },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro', provider: 'Google' },
  { id: 'google/gemini-3-pro-image', name: 'Gemini 3 Img', provider: 'Google' },
  { id: 'openai/gpt-5.1-thinking', name: 'GPT-5.1 Think', provider: 'OpenAI' },
  { id: 'openai/gpt-5.1-instant', name: 'GPT-5.1 Inst', provider: 'OpenAI' },
  { id: 'moonshotai/kimi-k2-0905', name: 'Kimi K2', provider: 'Moonshot AI' },
  { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi Think', provider: 'Moonshot AI' },
  { id: 'moonshotai/kimi-k2-thinking-turbo', name: 'Kimi Turbo', provider: 'Moonshot AI' },
  { id: 'perplexity/sonar-pro', name: 'Sonar Pro', provider: 'Perplexity' },
  { id: 'perplexity/sonar-reasoning-pro', name: 'Sonar Reason', provider: 'Perplexity' },
  { id: 'xai/grok-4.1-fast-non-reasoning', name: 'Grok 4.1', provider: 'xAI' },
  { id: 'xai/grok-4.1-fast-reasoning', name: 'Grok Reason', provider: 'xAI' },
  { id: 'deepseek/deepseek-v3.2-exp-thinking', name: 'DS Think', provider: 'DeepSeek' },
  { id: 'deepseek/deepseek-v3.2-exp', name: 'DS v3.2', provider: 'DeepSeek' },
  { id: 'mistral/ministral-3b', name: 'Ministral 3B', provider: 'Mistral' },
  { id: 'mistral/mistral-large', name: 'Mistral L', provider: 'Mistral' },
  { id: 'alibaba/qwen3-max-preview', name: 'Qwen3 Max', provider: 'Alibaba' },
];

export default function InternalLab() {
  const [testInput, setTestInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [autoTest, setAutoTest] = useState(true);
  const [testMode, setTestMode] = useState('single'); // 'single' or 'all'
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  const runValidationTest = async (modelId = 'anthropic/claude-sonnet-4.5') => {
    const validationPrompt = autoTest
      ? `Please answer these validation questions precisely:
1. What is your exact model name and version?
2. What is your knowledge cutoff date?
3. When were you released/announced?
4. What are your key capabilities?

Please be specific and factual in your answers.`
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

      const analysis = analyzeResponse(data.response, data, modelId);

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

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsLoading(false);
  };

  const analyzeResponse = (responseText, fullData, modelId) => {
    const analysis = {
      claims: [],
      flags: [],
      verdict: 'unknown',
    };

    const lower = responseText.toLowerCase();
    const modelName = ALL_MODELS.find(m => m.id === modelId)?.name || '';

    // Generic version detection
    const hasVersionMention = /\d+\.\d+/.test(responseText);
    
    // Check for Claude-specific issues
    if (modelId.includes('claude')) {
      if (lower.includes('4.5') || lower.includes('sonnet 4') || lower.includes('haiku 4') || lower.includes('opus 4')) {
        analysis.claims.push('✅ Claims to be Claude 4.x series');
      } else if (lower.includes('3.5') || lower.includes('claude 3')) {
        analysis.claims.push('⚠️ Identifies as Claude 3.x series');
        analysis.flags.push(`🚨 MODEL MISMATCH: Responding as 3.x instead of ${modelName}`);
      }

      if (lower.includes('april 2024') || lower.includes('2024-04')) {
        analysis.claims.push('⚠️ Knowledge cutoff: April 2024 (Claude 3.5 characteristic)');
        analysis.flags.push('🚨 OUTDATED CUTOFF: April 2024 is Claude 3.5, not 4.x');
      } else if (lower.includes('2025') || lower.includes('january 2025')) {
        analysis.claims.push('✅ Knowledge cutoff: 2025 (expected for Claude 4.x)');
      }

      if (lower.includes('june 2024') || lower.includes('2024-06')) {
        analysis.claims.push('⚠️ Release date: June 2024 (Claude 3.5 Sonnet release)');
        analysis.flags.push('🚨 WRONG RELEASE DATE: June 2024 is Claude 3.5');
      }
    }

    // Check if model responds appropriately
    if (!hasVersionMention && !lower.includes('cannot') && !lower.includes('don\'t have')) {
      analysis.flags.push('⚠️ Model did not provide version information');
    }

    // Determine verdict
    if (analysis.flags.length === 0 && analysis.claims.some(c => c.includes('✅'))) {
      analysis.verdict = 'correct';
    } else if (analysis.flags.some(f => f.includes('🚨'))) {
      analysis.verdict = 'incorrect';
    }

    return analysis;
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'correct':
        return 'bg-green-100 border-green-500 text-green-900';
      case 'incorrect':
        return 'bg-red-100 border-red-500 text-red-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getVerdictLabel = (verdict, modelName) => {
    switch (verdict) {
      case 'correct':
        return `✅ VERIFIED: Model appears to be ${modelName}`;
      case 'incorrect':
        return `❌ FAILED: Model is NOT ${modelName}`;
      default:
        return `⚠️ INCONCLUSIVE: Unable to verify ${modelName}`;
    }
  };

  const getBulkStats = () => {
    const passed = bulkResults.filter(r => r.success && r.analysis?.verdict === 'correct').length;
    const failed = bulkResults.filter(r => r.success && r.analysis?.verdict === 'incorrect').length;
    const errors = bulkResults.filter(r => !r.success).length;
    const inconclusive = bulkResults.filter(r => r.success && r.analysis?.verdict === 'unknown').length;

    return { passed, failed, errors, inconclusive, total: bulkResults.length };
  };

  return (
    <>
      <Head>
        <title>Internal Lab - Model Validator</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8 border-b border-gray-300 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🧪 Internal Lab</h1>
                <p className="text-sm text-gray-600 mt-2">AI Gateway Model Validator</p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-yellow-100 border-2 border-yellow-500 rounded-lg px-4 py-2">
                  <div className="text-xs font-bold text-yellow-800">⚠️ INTERNAL USE ONLY</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Mode Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Test Mode</h2>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setTestMode('single')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  testMode === 'single'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🎯 Single Model Test
              </button>
              <button
                onClick={() => setTestMode('all')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  testMode === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🚀 Test All {ALL_MODELS.length} Models
              </button>
            </div>
          </div>

          {/* Single Test Mode */}
          {testMode === 'single' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Single Model Configuration</h2>
              
              <div className="mb-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoTest}
                    onChange={(e) => setAutoTest(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium">Use automatic validation test</span>
                </label>
              </div>

              {!autoTest && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Custom Test Message:</label>
                  <textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter your test message..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-mono text-sm"
                    rows="4"
                  />
                </div>
              )}

              <button
                onClick={runSingleTest}
                disabled={isLoading || (!autoTest && !testInput.trim())}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  isLoading || (!autoTest && !testInput.trim())
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading ? 'Testing Claude Sonnet 4.5...' : '🧪 Test Claude Sonnet 4.5'}
              </button>
            </div>
          )}

          {/* Bulk Test Mode */}
          {testMode === 'all' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Bulk Test All Models</h2>
              <p className="text-sm text-gray-600 mb-4">
                This will test all {ALL_MODELS.length} models sequentially to identify which models are being correctly routed by Vercel AI Gateway.
              </p>

              {isLoading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress:</span>
                    <span className="font-semibold">
                      {bulkProgress.current} / {bulkProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={runBulkTest}
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading
                  ? `Testing ${bulkProgress.current}/${bulkProgress.total}...`
                  : `🚀 Test All ${ALL_MODELS.length} Models`}
              </button>
            </div>
          )}

          {/* Single Test Results */}
          {testMode === 'single' && results && (
            <div className="space-y-6">
              {results.analysis && (
                <div className={`rounded-xl border-4 p-6 ${getVerdictColor(results.analysis.verdict)}`}>
                  <h2 className="text-2xl font-bold mb-4">
                    {getVerdictLabel(results.analysis.verdict, 'Claude Sonnet 4.5')}
                  </h2>
                  
                  {results.analysis.flags.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">🚨 Issues Detected:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.analysis.flags.map((flag, idx) => (
                          <li key={idx} className="text-sm font-medium">{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.analysis.claims.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">📋 Model Claims:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.analysis.claims.map((claim, idx) => (
                          <li key={idx} className="text-sm">{claim}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {results.error && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-red-900 mb-2">❌ Error</h2>
                  <p className="text-red-800 font-mono text-sm">{results.error}</p>
                </div>
              )}

              {results.response && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-3">💬 Model Response</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">{results.response}</pre>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">🔧 Technical Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-1">MODEL REQUESTED</div>
                    <div className="font-mono text-sm font-bold text-blue-600">{results.modelRequested}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-1">RESPONSE TIME</div>
                    <div className="font-mono text-sm font-bold text-green-600">{results.responseTime}ms</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Test Results */}
          {testMode === 'all' && bulkResults.length > 0 && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">📊 Test Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{getBulkStats().total}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Tested</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-500">
                    <div className="text-2xl font-bold text-green-900">{getBulkStats().passed}</div>
                    <div className="text-xs text-green-700 mt-1">✅ Passed</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center border-2 border-red-500">
                    <div className="text-2xl font-bold text-red-900">{getBulkStats().failed}</div>
                    <div className="text-xs text-red-700 mt-1">❌ Failed</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center border-2 border-yellow-500">
                    <div className="text-2xl font-bold text-yellow-900">{getBulkStats().inconclusive}</div>
                    <div className="text-xs text-yellow-700 mt-1">⚠️ Inconclusive</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center border-2 border-orange-500">
                    <div className="text-2xl font-bold text-orange-900">{getBulkStats().errors}</div>
                    <div className="text-xs text-orange-700 mt-1">🔥 Errors</div>
                  </div>
                </div>
              </div>

              {/* Individual Results */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">🔍 Individual Model Results</h2>
                <div className="space-y-3">
                  {bulkResults.map((result, idx) => {
                    const statusColor = !result.success
                      ? 'border-orange-500 bg-orange-50'
                      : result.analysis?.verdict === 'correct'
                      ? 'border-green-500 bg-green-50'
                      : result.analysis?.verdict === 'incorrect'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-50';

                    return (
                      <details key={idx} className={`border-2 rounded-lg ${statusColor}`}>
                        <summary className="cursor-pointer p-4 font-semibold hover:opacity-80">
                          <span className="inline-block w-6">
                            {!result.success
                              ? '🔥'
                              : result.analysis?.verdict === 'correct'
                              ? '✅'
                              : result.analysis?.verdict === 'incorrect'
                              ? '❌'
                              : '⚠️'}
                          </span>
                          <span className="ml-2">{result.modelInfo.provider}</span>
                          <span className="mx-2">·</span>
                          <span className="font-bold">{result.modelInfo.name}</span>
                          <span className="ml-4 text-xs font-mono text-gray-500">{result.modelInfo.id}</span>
                        </summary>
                        <div className="p-4 pt-0 space-y-3">
                          {result.error && (
                            <div className="text-sm text-red-700 font-mono">
                              Error: {result.error}
                            </div>
                          )}
                          {result.analysis?.flags.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold mb-1">Issues:</div>
                              <ul className="text-sm space-y-1">
                                {result.analysis.flags.map((flag, i) => (
                                  <li key={i}>• {flag}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.response && (
                            <div>
                              <div className="text-sm font-semibold mb-1">Response:</div>
                              <div className="text-xs bg-white rounded p-2 font-mono max-h-40 overflow-y-auto">
                                {result.response.substring(0, 300)}
                                {result.response.length > 300 && '...'}
                              </div>
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            Response time: {result.responseTime}ms
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        code, pre {
          font-family: 'Fira Code', 'Courier New', monospace;
        }
      `}</style>
    </>
  );
}