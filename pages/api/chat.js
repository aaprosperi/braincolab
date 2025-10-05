export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model } = req.body;

  if (!messages || !model) {
    return res.status(400).json({ error: 'Missing messages or model' });
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'AI Gateway API key not configured. Please add AI_GATEWAY_API_KEY to your environment variables in Vercel.' 
    });
  }

  try {
    // Call Vercel AI Gateway with streaming enabled
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,  // ← ACTIVAR STREAMING
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI Gateway error:', errorData);
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid API key. Please check your AI_GATEWAY_API_KEY in Vercel environment variables.' 
        });
      }
      
      return res.status(response.status).json({ 
        error: `AI Gateway error: ${response.status}`,
        details: errorData
      });
    }

    // Configurar headers para Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Procesar el stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        res.write('data: [DONE]\n\n');
        res.end();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              // Enviar solo el contenido al frontend
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // Ignorar errores de parsing
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Failed to process chat request',
        details: error.message 
      });
    }
  }
}