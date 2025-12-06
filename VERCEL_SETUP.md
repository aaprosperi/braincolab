# Configuración de Vercel Postgres

## 🎯 Pasos para Configurar Vercel Postgres con pgvector

### 1. Crear Proyecto en Vercel

```bash
# Si no tienes Vercel CLI instalado
npm i -g vercel

# Link tu proyecto
vercel link
```

### 2. Crear Base de Datos Postgres

#### Desde el Dashboard de Vercel:

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a la pestaña **"Storage"**
4. Click en **"Create Database"**
5. Selecciona **"Postgres"**
6. Elige:
   - **Database Name**: braincolab-db (o el nombre que prefieras)
   - **Region**: Selecciona la más cercana a ti
7. Click en **"Create"**

#### Desde Vercel CLI:

```bash
vercel storage create postgres braincolab-db
```

### 3. Obtener Variables de Entorno

#### Opción A: Desde el Dashboard

1. En la página de tu base de datos, ve a **".env.local"** tab
2. Copia todas las variables:
   ```
   POSTGRES_URL=
   POSTGRES_URL_NON_POOLING=
   POSTGRES_USER=
   POSTGRES_HOST=
   POSTGRES_PASSWORD=
   POSTGRES_DATABASE=
   ```
3. Pégalas en tu archivo `.env.local`

#### Opción B: Desde CLI

```bash
vercel env pull .env.local
```

### 4. Habilitar pgvector

La extensión `pgvector` debería estar disponible por defecto en Vercel Postgres.

Si necesitas habilitarla manualmente:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Esto se hace automáticamente cuando ejecutas `npm run seed`.

### 5. Ejecutar Seed

```bash
npm run seed
```

Este comando:
- ✅ Crea la extensión pgvector
- ✅ Crea la tabla `notes`
- ✅ Inserta 10 notas de conocimiento
- ✅ Genera embeddings vectoriales
- ✅ Crea índices para búsquedas eficientes

### 6. Verificar Instalación

Deberías ver output como:

```
🌱 Iniciando seed de la base de datos...
✅ Tabla limpiada
📝 Usando embedding mock para: "Machine Learning Fundamentals"
✅ Insertada: "Machine Learning Fundamentals"
...
🎉 Seed completado exitosamente!
📊 Total de notas insertadas: 10
```

### 7. Deploy a Producción

```bash
# Build local
npm run build

# Deploy a Vercel
vercel --prod
```

## 🔧 Troubleshooting

### Error: "Cannot connect to database"

**Solución:**
1. Verifica que las variables de entorno estén en `.env.local`
2. Asegúrate de que las credenciales sean correctas
3. Verifica que la base de datos esté creada en Vercel

### Error: "Extension vector does not exist"

**Solución:**
Vercel Postgres debería tener pgvector disponible. Si no:

1. Ve a Vercel Dashboard → Storage → Tu DB
2. Ve a "Query" tab
3. Ejecuta:
   ```sql
   CREATE EXTENSION vector;
   ```

### Error al ejecutar seed

**Solución:**
```bash
# Asegúrate de tener tsx instalado
npm install -D tsx

# Verifica las variables de entorno
cat .env.local

# Ejecuta el seed con más detalle
npm run seed
```

## 📊 Consultas Útiles

### Ver todas las notas

```sql
SELECT id, title, tags FROM notes;
```

### Ver embeddings

```sql
SELECT id, title, embedding FROM notes LIMIT 1;
```

### Buscar notas similares

```sql
SELECT
  id,
  title,
  1 - (embedding <=> '[...]'::vector) as similarity
FROM notes
ORDER BY embedding <=> '[...]'::vector
LIMIT 5;
```

### Ver estadísticas

```sql
SELECT
  COUNT(*) as total_notes,
  COUNT(DISTINCT tags) as unique_tag_combinations,
  AVG(array_length(tags, 1)) as avg_tags_per_note
FROM notes;
```

## 🌐 Variables de Entorno en Producción

Para configurar en producción:

```bash
# Set individual variables
vercel env add OPENAI_API_KEY

# O edita desde el dashboard
# Vercel Dashboard → Settings → Environment Variables
```

## 🎨 Configuración de Dominio Personalizado

Para usar `braincolab.com`:

1. Ve a Vercel Dashboard → Settings → Domains
2. Agrega `braincolab.com`
3. Configura los DNS records según las instrucciones
4. Espera la propagación DNS (puede tomar hasta 48h)

Records típicos:
```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

## ✅ Checklist Final

- [ ] Proyecto creado en Vercel
- [ ] Base de datos Postgres creada
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Seed ejecutado exitosamente
- [ ] App corriendo en `localhost:3000`
- [ ] Deploy a producción realizado
- [ ] Dominio personalizado configurado (opcional)

## 📚 Recursos

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Next.js 14 Docs](https://nextjs.org/docs)
