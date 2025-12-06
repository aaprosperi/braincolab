import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            BrainColab
          </h1>
          <p className="text-xl text-gray-400">
            Tu espacio de conocimiento conectado
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/knowledge"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-8 transition-all hover:scale-105 hover:border-blue-500/50"
          >
            <div className="relative z-10">
              <div className="text-4xl mb-4">🧠</div>
              <h2 className="text-2xl font-bold mb-2 text-white">
                Grafo de Conocimiento
              </h2>
              <p className="text-gray-400">
                Explora y visualiza conexiones entre ideas y conceptos
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all" />
          </Link>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20 p-8 opacity-60 cursor-not-allowed">
            <div className="relative z-10">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold mb-2 text-white">
                Búsqueda Semántica
              </h2>
              <p className="text-gray-400">
                Próximamente: Encuentra información usando lenguaje natural
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-8 opacity-60 cursor-not-allowed">
            <div className="relative z-10">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-2xl font-bold mb-2 text-white">
                Chat IA
              </h2>
              <p className="text-gray-400">
                Próximamente: Conversa con tu base de conocimiento
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-8 opacity-60 cursor-not-allowed">
            <div className="relative z-10">
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-2xl font-bold mb-2 text-white">
                Notas Colaborativas
              </h2>
              <p className="text-gray-400">
                Próximamente: Crea y comparte conocimiento en tiempo real
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-gray-800/50 rounded-lg px-6 py-3 border border-gray-700">
            <p className="text-sm text-gray-400">
              Potenciado por{' '}
              <span className="text-blue-400 font-semibold">Next.js 14</span>,{' '}
              <span className="text-purple-400 font-semibold">Vercel Postgres</span>{' '}
              y{' '}
              <span className="text-pink-400 font-semibold">pgvector</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
