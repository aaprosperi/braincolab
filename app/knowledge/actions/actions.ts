'use server';

import { sql } from '@vercel/postgres';

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
}

export interface GraphData {
  nodes: Array<{
    id: string;
    title: string;
    tags: string[];
    color: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    value: number;
  }>;
}

// Función para calcular similitud coseno entre dos vectores
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Obtener todas las notas
export async function getAllNotes(): Promise<Note[]> {
  try {
    const result = await sql`
      SELECT id, title, content, tags
      FROM notes
      ORDER BY created_at DESC
    `;

    return result.rows as Note[];
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
}

// Obtener datos del grafo con conexiones basadas en similitud
export async function getGraphData(): Promise<GraphData> {
  try {
    const result = await sql`
      SELECT id, title, tags, embedding
      FROM notes
      ORDER BY id
    `;

    const notes = result.rows;

    // Crear nodos
    const nodes = notes.map((note: any) => {
      // Asignar color según el primer tag
      const primaryTag = note.tags[0] || 'default';
      const colors: Record<string, string> = {
        'IA': '#FF6B6B',
        'Machine Learning': '#4ECDC4',
        'Deep Learning': '#45B7D1',
        'NLP': '#96CEB4',
        'Neural Networks': '#FFEAA7',
        'Grafos': '#DDA15E',
        'Embeddings': '#BC6C25',
        'Transformers': '#6C5CE7',
        'RAG': '#00B894',
        'Attention': '#FD79A8',
        'default': '#74B9FF',
      };

      return {
        id: note.id.toString(),
        title: note.title,
        tags: note.tags,
        color: colors[primaryTag] || colors.default,
      };
    });

    // Crear enlaces basados en similitud de embeddings
    const links: Array<{ source: string; target: string; value: number }> = [];
    const threshold = 0.5; // Umbral de similitud para crear enlace

    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const note1 = notes[i];
        const note2 = notes[j];

        // Verificar si comparten tags
        const sharedTags = note1.tags.filter((tag: string) =>
          note2.tags.includes(tag)
        ).length;

        // Si comparten tags, calcular similitud
        if (sharedTags > 0 && note1.embedding && note2.embedding) {
          // Parsear embeddings (están almacenados como strings en Postgres)
          let embedding1: number[];
          let embedding2: number[];

          if (typeof note1.embedding === 'string') {
            embedding1 = JSON.parse(note1.embedding);
          } else {
            embedding1 = note1.embedding;
          }

          if (typeof note2.embedding === 'string') {
            embedding2 = JSON.parse(note2.embedding);
          } else {
            embedding2 = note2.embedding;
          }

          const similarity = cosineSimilarity(embedding1, embedding2);

          // Crear enlace si la similitud supera el umbral
          if (similarity > threshold) {
            links.push({
              source: note1.id.toString(),
              target: note2.id.toString(),
              value: similarity,
            });
          }
        }
      }
    }

    return { nodes, links };
  } catch (error) {
    console.error('Error fetching graph data:', error);
    throw error;
  }
}

// Buscar notas similares a un texto
export async function searchSimilarNotes(query: string): Promise<Note[]> {
  try {
    // Esta función requeriría generar el embedding del query
    // Por ahora, hacemos una búsqueda simple por título y contenido
    const result = await sql`
      SELECT id, title, content, tags
      FROM notes
      WHERE
        title ILIKE ${'%' + query + '%'}
        OR content ILIKE ${'%' + query + '%'}
        OR EXISTS (
          SELECT 1 FROM unnest(tags) tag WHERE tag ILIKE ${'%' + query + '%'}
        )
      LIMIT 10
    `;

    return result.rows as Note[];
  } catch (error) {
    console.error('Error searching notes:', error);
    throw error;
  }
}
