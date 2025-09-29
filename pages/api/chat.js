import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model } = req.body;

    if (!process.env.AI_GATEWAY_API_KEY) {
      return res.status(500).json({ 
        error: 'API Key no configurada. Agrega AI_GATEWAY_API_KEY en Variables de Entorno de Vercel' 
      });
    }

    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const completion = await openai.chat.completions.create({
      model: model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return res.status(200).json({
      message: completion.choices[0].message.content,
      model: model,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Error en API de chat:', error);
    
    if (error.status === 401) {
      return res.status(401).json({ 
        error: 'API Key inválida. Verifica tu configuración en Vercel.' 
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Límite de rate excedido. Intenta de nuevo más tarde.' 
      });
    }

    if (error.status === 400) {
      return res.status(400).json({ 
        error: `Modelo no soportado o configuración incorrecta: ${error.message}` 
      });
    }

    return res.status(500).json({ 
      error: `Error del servidor: ${error.message}` 
    });
  }
}