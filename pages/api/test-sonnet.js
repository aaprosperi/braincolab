export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const modelId = 'anthropic/claude-sonnet-4.5';
  const aiGatewayUrl = 'https://ai-gateway.vercel.sh/v1/chat/completions';

  const requestPayload = {
    model: modelId,
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
    temperature: 0.1, // Low temperature for consistent validation responses
    max_tokens: 1000,
  };

  try {
    const response = await fetch(aiGatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VERCEL_AI_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      return res.status(response.status).json({
        error: `AI Gateway error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    // Extract response headers for debugging
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Return comprehensive test results
    return res.status(200).json({
      modelRequested: modelId,
      response: data.choices[0].message.content,
      usage: data.usage,
      headers: responseHeaders,
      requestDetails: {
        url: aiGatewayUrl,
        model: modelId,
        temperature: requestPayload.temperature,
        max_tokens: requestPayload.max_tokens,
      },
      rawResponse: data,
    });
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}