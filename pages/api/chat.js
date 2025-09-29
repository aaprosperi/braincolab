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
    // Call Vercel AI Gateway
    const response = await fetch('https://gateway.vercel.sh/v1/chat/completions', {
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

    const data = await response.json();
    
    // Extract the message from the response
    const message = data.choices?.[0]?.message?.content || 'No response from AI';
    
    return res.status(200).json({ 
      message,
      usage: data.usage,
      model: data.model
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error.message 
    });
  }
}