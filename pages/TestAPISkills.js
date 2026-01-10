import { useState } from 'react';
import Head from 'next/head';

export default function TestAPISkills() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('sonnet');
  const [useSkills, setUseSkills] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('xlsx');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const models = {
    opus: {
      id: 'anthropic/claude-opus-4-5',
      name: 'Claude Opus 4.5',
      color: 'purple'
    },
    sonnet: {
      id: 'anthropic/claude-sonnet-4-5',
      name: 'Claude Sonnet 4.5', 
      color: 'blue'
    }
  };

  const skills = [
    { id: 'xlsx', name: 'Excel (xlsx)', description: 'Crear/editar hojas de cálculo' },
    { id: 'pptx', name: 'PowerPoint (pptx)', description: 'Crear presentaciones' },
    { id: 'docx', name: 'Word (docx)', description: 'Crear documentos' },
    { id: 'pdf', name: 'PDF', description: 'Manipular PDFs' }
  ];

  const sendRequest = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/test-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: models[selectedModel].id,
          modelName: models[selectedModel].name,
          useSkills,
          skillId: useSkills ? selectedSkill : null
        })
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      const newResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        prompt,
        model: models[selectedModel].name,
        modelId: models[selectedModel].id,
        modelColor: models[selectedModel].color,
        useSkills,
        skill: useSkills ? selectedSkill : null,
        response: data.response || data.error,
        success: !data.error,
        duration,
        rawRequest: data.rawRequest,
        rawResponse: data.rawResponse
      };
      
      setResults(prev => [newResult, ...prev]);
    } catch (error) {
      const newResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        prompt,
        model: models[selectedModel].name,
        modelId: models[selectedModel].id,
        modelColor: models[selectedModel].color,
        useSkills,
        skill: useSkills ? selectedSkill : null,
        response: `Error: ${error.message}`,
        success: false,
        duration: Date.now() - startTime
      };
      setResults(prev => [newResult, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Claude Skills Test Lab | BrainCoLab</title>
      </Head>
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Claude Skills Test Lab</h1>
          <p className="text-gray-400">Prueba AI Gateway con Claude Opus 4.5 y Sonnet 4.5 - Con y Sin Skills</p>
        </div>

        {/* Control Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {/* Prompt Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Escribe tu prompt aquí... Ej: Crea un Excel con un presupuesto mensual simple"
              className="w-full h-32 bg-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Model Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Modelo</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedModel('opus')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedModel === 'opus'
                      ? 'bg-purple-600 ring-2 ring-purple-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  🟣 Opus 4.5
                </button>
                <button
                  onClick={() => setSelectedModel('sonnet')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedModel === 'sonnet'
                      ? 'bg-blue-600 ring-2 ring-blue-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  🔵 Sonnet 4.5
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                ID: {models[selectedModel].id}
              </p>
            </div>

            {/* Skills Toggle */}
            <div>
              <label className="block text-sm font-medium mb-2">Skills</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUseSkills(false)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    !useSkills
                      ? 'bg-gray-600 ring-2 ring-gray-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ❌ Sin Skills
                </button>
                <button
                  onClick={() => setUseSkills(true)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    useSkills
                      ? 'bg-green-600 ring-2 ring-green-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ✅ Con Skills
                </button>
              </div>
            </div>
          </div>

          {/* Skill Selection (if enabled) */}
          {useSkills && (
            <div className="mb-4 p-4 bg-gray-700 rounded-lg">
              <label className="block text-sm font-medium mb-2">Selecciona Skill</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {skills.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill.id)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      selectedSkill === skill.id
                        ? 'bg-green-600 ring-2 ring-green-400'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    <div className="font-medium text-sm">{skill.name}</div>
                    <div className="text-xs text-gray-300">{skill.description}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ Skills requiere headers beta: code-execution-2025-08-25, skills-2025-10-02
              </p>
            </div>
          )}

          {/* Send Button */}
          <div className="flex gap-2">
            <button
              onClick={sendRequest}
              disabled={loading || !prompt.trim()}
              className={`flex-1 py-3 px-6 rounded-lg font-bold text-lg transition-all ${
                loading || !prompt.trim()
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {loading ? '⏳ Procesando...' : '🚀 Enviar'}
            </button>
            <button
              onClick={clearResults}
              className="py-3 px-6 rounded-lg font-medium bg-red-600 hover:bg-red-700 transition-all"
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">📊 Resultados ({results.length})</h2>
          
          {results.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
              <p>No hay resultados aún. Envía un prompt para comenzar.</p>
            </div>
          )}

          {results.map(result => (
            <div
              key={result.id}
              className={`bg-gray-800 rounded-lg overflow-hidden border-l-4 ${
                result.success
                  ? result.modelColor === 'purple' ? 'border-purple-500' : 'border-blue-500'
                  : 'border-red-500'
              }`}
            >
              {/* Result Header */}
              <div className="bg-gray-750 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    result.modelColor === 'purple' ? 'bg-purple-600' : 'bg-blue-600'
                  }`}>
                    {result.model}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.useSkills ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {result.useSkills ? `✅ Skill: ${result.skill}` : '❌ Sin Skills'}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.success ? 'bg-green-700' : 'bg-red-700'
                  }`}>
                    {result.success ? '✓ OK' : '✗ Error'}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {result.timestamp} • {result.duration}ms
                </div>
              </div>

              {/* Prompt */}
              <div className="px-4 py-3 bg-gray-750">
                <div className="text-xs text-gray-400 mb-1">Prompt:</div>
                <div className="text-sm text-gray-300">{result.prompt}</div>
              </div>

              {/* Response */}
              <div className="px-4 py-4">
                <div className="text-xs text-gray-400 mb-2">Respuesta:</div>
                <div className="bg-gray-900 rounded p-4 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {result.response}
                </div>
              </div>

              {/* Debug Info (collapsible) */}
              <details className="px-4 pb-4">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                  🔍 Ver detalles técnicos
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Model ID:</div>
                    <code className="text-xs bg-gray-900 px-2 py-1 rounded">{result.modelId}</code>
                  </div>
                  {result.rawRequest && (
                    <div>
                      <div className="text-xs text-gray-500">Request enviado:</div>
                      <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto max-h-48">
                        {JSON.stringify(result.rawRequest, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.rawResponse && (
                    <div>
                      <div className="text-xs text-gray-500">Response completo:</div>
                      <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto max-h-48">
                        {JSON.stringify(result.rawResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔬 Test Lab para verificar compatibilidad de Claude Skills con Vercel AI Gateway</p>
          <p className="mt-1">Modelos: anthropic/claude-opus-4-5, anthropic/claude-sonnet-4-5</p>
        </div>
      </div>
    </div>
  );
}
