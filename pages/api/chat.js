import { API_CONFIG, ERROR_MESSAGES } from '../../utils/config';

/**
 * Create a timeout promise that rejects after the specified duration
 */
const createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(ERROR_MESSAGES.STREAM_TIMEOUT)), ms);
  });
};

/**
 * Process streaming response from AI Gateway
 */
const processStream = async (response, res, timeoutMs) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      // Race between reading and timeout
      const { done, value } = await Promise.race([
        reader.read(),
        createTimeout(timeoutMs)
      ]);

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
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // Ignore parsing errors for malformed chunks
            console.warn('Failed to parse chunk:', e.message);
          }
        }
      }
    }
  } catch (error) {
    // Ensure reader is closed on error
    try {
      await reader.cancel();
    } catch (cancelError) {
      console.error('Error cancelling reader:', cancelError);
    }
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model, max_tokens, temperature } = req.body;

  if (!messages || !model) {
    return res.status(400).json({ error: ERROR_MESSAGES.MISSING_PARAMS });
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: ERROR_MESSAGES.NO_API_KEY
    });
  }

  try {
    // Call Vercel AI Gateway with streaming enabled
    const response = await fetch(API_CONFIG.GATEWAY_URL, {
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
        max_tokens: max_tokens || API_CONFIG.DEFAULT_MAX_TOKENS,
        temperature: temperature !== undefined ? temperature : API_CONFIG.DEFAULT_TEMPERATURE,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI Gateway error:', errorData);

      if (response.status === 401) {
        return res.status(401).json({
          error: ERROR_MESSAGES.INVALID_API_KEY
        });
      }

      return res.status(response.status).json({
        error: `${ERROR_MESSAGES.GATEWAY_ERROR}: ${response.status}`,
        details: errorData
      });
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Process the stream with timeout protection
    await processStream(response, res, API_CONFIG.STREAM_TIMEOUT);

  } catch (error) {
    console.error('Chat API error:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Failed to process chat request',
        details: error.message
      });
    } else {
      // If headers already sent, try to send error as SSE
      try {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      } catch (writeError) {
        console.error('Failed to write error to response:', writeError);
      }
    }
  }
}
