import { sql } from '@vercel/postgres';

// Función para generar embeddings mock (1536 dimensiones como OpenAI)
function generateMockEmbedding(text: string): number[] {
  const hash = text.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  const embedding: number[] = [];
  for (let i = 0; i < 1536; i++) {
    const seed = (hash + i) * 9301 + 49297;
    const value = (seed % 233280) / 233280.0;
    embedding.push((value - 0.5) * 2);
  }

  // Normalizar el vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

// Función para generar embedding real con OpenAI (si hay API key)
async function generateRealEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating real embedding:', error);
    return null;
  }
}

// 10 notas de conocimiento de ejemplo
const knowledgeNotes = [
  {
    title: 'Machine Learning Fundamentals',
    content: 'Machine learning es un subcampo de la inteligencia artificial que permite a las computadoras aprender de datos sin ser programadas explícitamente. Los algoritmos de ML identifican patrones y toman decisiones basadas en ejemplos.',
    tags: ['IA', 'Machine Learning', 'Data Science'],
  },
  {
    title: 'Neural Networks Architecture',
    content: 'Las redes neuronales son modelos computacionales inspirados en el cerebro humano. Consisten en capas de neuronas artificiales conectadas que procesan información mediante pesos y funciones de activación.',
    tags: ['IA', 'Deep Learning', 'Neural Networks'],
  },
  {
    title: 'Natural Language Processing',
    content: 'El procesamiento de lenguaje natural (NLP) permite a las máquinas entender, interpretar y generar lenguaje humano. Incluye tareas como traducción, análisis de sentimientos y generación de texto.',
    tags: ['NLP', 'IA', 'Lingüística Computacional'],
  },
  {
    title: 'Vector Databases',
    content: 'Las bases de datos vectoriales almacenan y recuperan embeddings de alta dimensión de manera eficiente. Son fundamentales para aplicaciones de búsqueda semántica y sistemas de recomendación.',
    tags: ['Bases de Datos', 'Embeddings', 'Search'],
  },
  {
    title: 'Embeddings y Representación Semántica',
    content: 'Los embeddings son representaciones vectoriales densas de datos (texto, imágenes, audio) que capturan significado semántico. Palabras o conceptos similares tienen vectores cercanos en el espacio vectorial.',
    tags: ['Embeddings', 'NLP', 'Semántica'],
  },
  {
    title: 'Graph Neural Networks',
    content: 'Las GNN son redes neuronales diseñadas para procesar datos estructurados como grafos. Son útiles para analizar redes sociales, moléculas químicas y sistemas de recomendación.',
    tags: ['Grafos', 'Deep Learning', 'Neural Networks'],
  },
  {
    title: 'Knowledge Graphs',
    content: 'Los grafos de conocimiento representan información como nodos (entidades) y aristas (relaciones). Permiten realizar inferencias y descubrir conexiones entre conceptos de manera visual e intuitiva.',
    tags: ['Grafos', 'Knowledge Management', 'Semántica'],
  },
  {
    title: 'Transformer Architecture',
    content: 'Los transformers revolucionaron el NLP mediante mecanismos de atención que procesan secuencias completas en paralelo. Son la base de modelos como GPT, BERT y otros LLMs modernos.',
    tags: ['Transformers', 'Deep Learning', 'NLP'],
  },
  {
    title: 'RAG (Retrieval Augmented Generation)',
    content: 'RAG combina búsqueda de información con generación de lenguaje. Primero recupera documentos relevantes de una base de datos vectorial, luego los usa como contexto para generar respuestas precisas.',
    tags: ['RAG', 'LLM', 'Search', 'IA'],
  },
  {
    title: 'Attention Mechanisms',
    content: 'Los mecanismos de atención permiten a las redes neuronales enfocarse en partes relevantes de la entrada. La auto-atención en transformers calcula relaciones entre todas las posiciones de una secuencia.',
    tags: ['Attention', 'Transformers', 'Deep Learning'],
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Crear extensión y tabla si no existen
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
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

    // Limpiar datos existentes
    await sql`TRUNCATE TABLE notes RESTART IDENTITY`;
    console.log('✅ Tabla limpiada');

    // Insertar notas
    for (const note of knowledgeNotes) {
      const combinedText = `${note.title} ${note.content}`;

      // Intentar generar embedding real, si no, usar mock
      let embedding = await generateRealEmbedding(combinedText);
      if (!embedding) {
        console.log(`📝 Usando embedding mock para: "${note.title}"`);
        embedding = generateMockEmbedding(combinedText);
      } else {
        console.log(`🤖 Usando embedding real para: "${note.title}"`);
      }

      const embeddingStr = `[${embedding.join(',')}]`;

      await sql`
        INSERT INTO notes (title, content, tags, embedding)
        VALUES (
          ${note.title},
          ${note.content},
          ${note.tags},
          ${embeddingStr}::vector
        )
      `;

      console.log(`✅ Insertada: "${note.title}"`);
    }

    // Crear índice para búsquedas vectoriales
    await sql`
      CREATE INDEX IF NOT EXISTS notes_embedding_idx
      ON notes USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `;

    console.log('\n🎉 Seed completado exitosamente!');
    console.log(`📊 Total de notas insertadas: ${knowledgeNotes.length}`);

    // Mostrar algunas estadísticas
    const stats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT tags) as unique_tag_arrays
      FROM notes
    `;

    console.log(`📈 Estadísticas:`, stats.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seedDatabase();
