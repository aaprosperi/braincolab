'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { GraphData } from '../actions/actions';

// Importar ForceGraph2D dinámicamente para evitar SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

interface KnowledgeGraphProps {
  data: GraphData;
}

export default function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  const graphRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    // Ajustar dimensiones al tamaño de la ventana
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 200,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    // Centrar el grafo cuando se carga
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  }, [data]);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);

    // Centrar en el nodo clickeado
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2, 1000);
    }
  };

  const handleBackgroundClick = () => {
    setSelectedNode(null);
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-10 bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg border border-gray-700 max-w-md">
        <h2 className="text-xl font-bold mb-2">Grafo de Conocimiento</h2>
        <p className="text-sm text-gray-300 mb-2">
          {data.nodes.length} notas conectadas por similitud semántica
        </p>
        <div className="text-xs text-gray-400">
          <p>💡 Click en un nodo para ver detalles</p>
          <p>🖱️ Arrastra para moverte</p>
          <p>🔍 Scroll para zoom</p>
        </div>
      </div>

      {selectedNode && (
        <div className="absolute top-4 right-4 z-10 bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg border border-gray-700 max-w-sm">
          <button
            onClick={handleBackgroundClick}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          <h3 className="text-lg font-bold mb-2 pr-6">{selectedNode.title}</h3>
          <div className="flex flex-wrap gap-2">
            {selectedNode.tags?.map((tag: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="graph-container">
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel="title"
          nodeColor={(node: any) => node.color}
          nodeRelSize={8}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.title;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;

            // Dibujar el nodo
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();

            // Dibujar borde si está seleccionado
            if (selectedNode?.id === node.id) {
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 3 / globalScale;
              ctx.stroke();
            }

            // Dibujar etiqueta
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(label, node.x, node.y + 15);
          }}
          linkColor={() => 'rgba(255, 255, 255, 0.2)'}
          linkWidth={(link: any) => link.value * 2}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={(link: any) => link.value * 2}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          backgroundColor="#0a0a0a"
        />
      </div>

      <style jsx>{`
        .graph-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
