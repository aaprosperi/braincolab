import { getGraphData } from './actions/actions';
import KnowledgeGraph from './components/KnowledgeGraph';

export const dynamic = 'force-dynamic';

export default async function KnowledgePage() {
  let graphData;
  let error = null;

  try {
    graphData = await getGraphData();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error al cargar datos';
    console.error('Error loading graph data:', e);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="max-w-md p-8 bg-gray-900 rounded-lg border border-gray-800">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="text-sm text-gray-400 bg-gray-800 p-4 rounded">
            <p className="font-semibold mb-2">Para resolver este error:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Configura las variables de entorno de Vercel Postgres</li>
              <li>Ejecuta el script de seed: <code className="bg-gray-700 px-2 py-1 rounded">npm run seed</code></li>
              <li>Recarga la página</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="max-w-md p-8 bg-gray-900 rounded-lg border border-gray-800">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">
            No hay datos
          </h1>
          <p className="text-gray-300 mb-4">
            La base de datos está vacía. Ejecuta el script de seed para generar
            datos de ejemplo.
          </p>
          <code className="block bg-gray-800 p-4 rounded text-sm text-green-400">
            npm run seed
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            BrainColab
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Visualización interactiva de conocimiento
          </p>
        </div>
      </header>

      <main className="h-[calc(100vh-100px)]">
        <KnowledgeGraph data={graphData} />
      </main>
    </div>
  );
}
