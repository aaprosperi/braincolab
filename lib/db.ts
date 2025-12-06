import { sql } from '@vercel/postgres';

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  embedding: number[];
  created_at: Date;
}

export interface GraphNode {
  id: string;
  title: string;
  tags: string[];
  color: string;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export async function initDatabase() {
  try {
    // Crear extensión pgvector
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;

    // Crear tabla de notas
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT[] NOT NULL DEFAULT '{}',
        embedding vector(1536),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear índice para búsquedas vectoriales
    await sql`
      CREATE INDEX IF NOT EXISTS notes_embedding_idx
      ON notes USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function getSimilarNotes(embedding: number[], limit: number = 5) {
  const embeddingStr = `[${embedding.join(',')}]`;

  const result = await sql`
    SELECT
      id,
      title,
      content,
      tags,
      1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM notes
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return result.rows;
}
