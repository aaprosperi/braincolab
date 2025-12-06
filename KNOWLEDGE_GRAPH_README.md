# BrainColab - Knowledge Graph

Aplicación Next.js 14 (App Router) con visualización de grafo de conocimiento usando Vercel Postgres y pgvector.

## 🚀 Características

- ✅ Next.js 14 con App Router
- ✅ Vercel Postgres con extensión pgvector
- ✅ Visualización interactiva con react-force-graph-2d
- ✅ Server Actions para data fetching
- ✅ 10 notas de conocimiento sobre IA/ML pre-cargadas
- ✅ Embeddings vectoriales para similitud semántica
- ✅ Interfaz moderna con Tailwind CSS

## 📦 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Vercel Postgres

#### Opción A: Desde Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Ve a la pestaña "Storage"
3. Crea una nueva base de datos Postgres
4. Copia las variables de entorno

#### Opción B: Desde Vercel CLI

```bash
vercel link
vercel env pull .env.local
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` con:

```env
# Vercel Postgres (obtenidas del dashboard o CLI)
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# OpenAI API (opcional, para embeddings reales)
OPENAI_API_KEY=
```

### 4. Ejecutar el script de seed

Este script:
- Crea la extensión pgvector
- Crea la tabla de notas
- Inserta 10 notas de conocimiento sobre IA/ML
- Genera embeddings (mock o reales si tienes API key de OpenAI)

```bash
npm run seed
```

### 5. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🗂️ Estructura del Proyecto

```
braincolab/
├── app/
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Página de inicio
│   ├── globals.css             # Estilos globales
│   └── knowledge/
│       ├── page.tsx            # Página del grafo
│       ├── actions/
│       │   └── actions.ts      # Server Actions
│       └── components/
│           └── KnowledgeGraph.tsx  # Componente del grafo
├── lib/
│   └── db.ts                   # Utilidades de base de datos
├── scripts/
│   └── seed.ts                 # Script de seed
└── package.json
```

## 🎨 Uso

### Visualización del Grafo

1. Ve a `/knowledge` para ver el grafo de conocimiento
2. Click en un nodo para ver sus detalles
3. Arrastra para moverte por el grafo
4. Usa scroll para hacer zoom

### Características del Grafo

- **Nodos**: Representan notas de conocimiento
- **Enlaces**: Conectan notas similares (similitud > 0.5)
- **Colores**: Cada color representa un tag principal
- **Tamaño de enlace**: Proporcional a la similitud semántica

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run type-check   # Verificar tipos TypeScript
npm run seed         # Poblar base de datos
```

## 📊 Base de Datos

### Schema

```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX notes_embedding_idx
ON notes USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Extensión pgvector

La extensión pgvector permite:
- Almacenar embeddings vectoriales
- Búsquedas de similitud eficientes
- Operaciones vectoriales (cosine, L2, inner product)

## 🚀 Deploy en Vercel

1. Conecta tu repositorio en Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

```bash
vercel
```

## 📝 Notas

- Los embeddings mock son generados de forma determinista basados en el texto
- Para usar embeddings reales de OpenAI, agrega `OPENAI_API_KEY` al `.env.local`
- La similitud se calcula usando distancia coseno entre vectores

## 🔮 Próximas Funcionalidades

- [ ] Búsqueda semántica de notas
- [ ] Chat IA con la base de conocimiento
- [ ] Crear/editar notas desde la UI
- [ ] Filtros por tags
- [ ] Exportar grafo como imagen

## 📄 Licencia

MIT
