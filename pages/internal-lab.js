import { useState } from 'react';
import Head from 'next/head';

export default function InternalLab() {
  const [testInput, setTestInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [autoTest, setAutoTest] = useState(true);

  const runValidationTest = async () => {
    setIsLoading(true);
    setResults(null);

    const validationPrompt = autoTest
      ? `Please answer these validation questions precisely:
1. What is your exact model name and version?
2. What is your knowledge cutoff date?
3. When were you released/announced?
4. What are your key capabilities that distinguish you from Claude 3.5 Sonnet?

Please be specific and factual in your answers.`
      : testInput;

    try {
      const startTime = Date.now();
      
      const response = await fetch('/api/test-sonnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: validationPrompt,
        }),
      });

      const endTime = Date.now();
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Test failed');
      }

      // Analyze the response
      const analysis = analyzeResponse(data.response, data);

      setResults({
        ...data,
        responseTime: endTime - startTime,
        analysis,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setResults({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeResponse = (responseText, fullData) => {
    const analysis = {
      claims: [],
      flags: [],
      verdict: 'unknown',
    };

    const lower = responseText.toLowerCase();

    // Check for version mentions
    if (lower.includes('4.5') || lower.includes('sonnet 4')) {
      analysis.claims.push('✅ Claims to be Claude Sonnet 4.5 or 4.x');
    } else if (lower.includes('3.5') || lower.includes('claude 3')) {
      analysis.claims.push('⚠️ Identifies as Claude 3.5 or 3.x');
      analysis.flags.push('🚨 MODEL MISMATCH: Responding as 3.5 instead of 4.5');
    }

    // Check knowledge cutoff
    if (lower.includes('april 2024') || lower.includes('2024-04')) {
      analysis.claims.push('⚠️ Knowledge cutoff: April 2024 (Claude 3.5 characteristic)');
      analysis.flags.push('🚨 OUTDATED CUTOFF: April 2024 is Claude 3.5, not 4.5');
    } else if (lower.includes('2025') || lower.includes('january 2025')) {
      analysis.claims.push('✅ Knowledge cutoff: 2025 (expected for Claude 4.5)');
    }

    // Check release date
    if (lower.includes('june 2024') || lower.includes('2024-06')) {
      analysis.claims.push('⚠️ Release date: June 2024 (Claude 3.5 Sonnet release)');
      analysis.flags.push('🚨 WRONG RELEASE DATE: June 2024 is Claude 3.5');
    }

    // Determine verdict
    if (analysis.flags.length === 0 && analysis.claims.some(c => c.includes('4.5'))) {
      analysis.verdict = 'correct';
    } else if (analysis.flags.length > 0) {
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

  const getVerdictLabel = (verdict) => {
    switch (verdict) {
      case 'correct':
        return '✅ VERIFIED: Model is Claude Sonnet 4.5';
      case 'incorrect':
        return '❌ FAILED: Model is NOT Claude Sonnet 4.5';
      default:
        return '⚠️ INCONCLUSIVE: Unable to verify model';
    }
  };

  return (
    <>
      <Head>
        <title>Internal Lab - Sonnet 4.5 Validator</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-5xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8 border-b border-gray-300 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🧪 Internal Lab</h1>
                <p className="text-sm text-gray-600 mt-2">Claude Sonnet 4.5 Model Validator</p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-yellow-100 border-2 border-yellow-500 rounded-lg px-4 py-2">
                  <div className="text-xs font-bold text-yellow-800">⚠️ INTERNAL USE ONLY</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Test Configuration</h2>
            
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
              <p className="text-xs text-gray-500 mt-1 ml-7">
                Automatically sends validation questions to verify model identity
              </p>
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
              onClick={runValidationTest}
              disabled={isLoading || (!autoTest && !testInput.trim())}
              className={'w-full py-3 px-6 rounded-lg font-semibold transition-all ' +
                (isLoading || (!autoTest && !testInput.trim())
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg')
              }
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing Model...
                </span>
              ) : (
                '🧪 Run Validation Test'
              )}
            </button>
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-6">
              {/* Verdict Banner */}
              {results.analysis && (
                <div className={'rounded-xl border-4 p-6 ' + getVerdictColor(results.analysis.verdict)}>
                  <h2 className="text-2xl font-bold mb-4">{getVerdictLabel(results.analysis.verdict)}</h2>
                  
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

              {/* Error Display */}
              {results.error && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-red-900 mb-2">❌ Error</h2>
                  <p className="text-red-800 font-mono text-sm">{results.error}</p>
                </div>
              )}

              {/* Model Response */}
              {results.response && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-3">💬 Model Response</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">{results.response}</pre>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">🔧 Technical Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-1">MODEL REQUESTED</div>
                    <div className="font-mono text-sm font-bold text-blue-600">{results.modelRequested}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-1">RESPONSE TIME</div>
                    <div className="font-mono text-sm font-bold text-green-600">{results.responseTime}ms</div>
                  </div>

                  {results.usage && (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 mb-1">INPUT TOKENS</div>
                        <div className="font-mono text-sm font-bold">{results.usage.prompt_tokens}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 mb-1">OUTPUT TOKENS</div>
                        <div className="font-mono text-sm font-bold">{results.usage.completion_tokens}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Request Details */}
                <details className="mb-4">
                  <summary className="cursor-pointer font-semibold text-sm text-gray-700 hover:text-gray-900 mb-2">
                    📤 Request Sent (Click to expand)
                  </summary>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono">{JSON.stringify(results.requestDetails, null, 2)}</pre>
                  </div>
                </details>

                {/* Response Headers */}
                {results.headers && (
                  <details>
                    <summary className="cursor-pointer font-semibold text-sm text-gray-700 hover:text-gray-900 mb-2">
                      📥 Response Headers (Click to expand)
                    </summary>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs text-blue-400 font-mono">{JSON.stringify(results.headers, null, 2)}</pre>
                    </div>
                  </details>
                )}
              </div>

              {/* Metadata */}
              <div className="text-xs text-gray-500 text-center">
                Test timestamp: {new Date(results.timestamp).toLocaleString()}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!results && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">ℹ️ How This Works</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• This lab sends a request directly to <code className="bg-blue-100 px-2 py-1 rounded">anthropic/claude-sonnet-4.5</code> via Vercel AI Gateway</li>
                <li>• The automatic validation test asks the model to identify itself and provide key information</li>
                <li>• We analyze the response to detect if it's actually Claude Sonnet 4.5 or an older version</li>
                <li>• All request/response details are logged for debugging</li>
              </ul>
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