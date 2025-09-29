export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">Brain Co-Lab</h1>
          <p className="text-xl text-gray-300">Colabora con las mejores IAs del mundo en un solo lugar</p>
        </header>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
            <h3 className="text-2xl font-semibold mb-4">🚀 Multi-AI Chat</h3>
            <p className="mb-4">Interactúa con GPT-4, Claude, y Gemini simultáneamente</p>
            <a href="/multiAI" className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
              Comenzar Chat
            </a>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
            <h3 className="text-2xl font-semibold mb-4">⚡ Respuestas Instantáneas</h3>
            <p>Obtén respuestas de múltiples modelos de IA al mismo tiempo</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
            <h3 className="text-2xl font-semibold mb-4">🔒 Seguro y Privado</h3>
            <p>Tus conversaciones están protegidas con encriptación de extremo a extremo</p>
          </div>
        </div>
        
        <div className="text-center">
          <a href="/multiAI" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-10 py-4 rounded-full transition-all transform hover:scale-105">
            Iniciar Brain Co-Lab
          </a>
        </div>
      </div>
    </div>
  )
}