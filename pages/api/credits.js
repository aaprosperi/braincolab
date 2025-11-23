export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({
      credits: 0,
      currency: 'USD',
      updated_at: new Date().toISOString(),
      note: 'Configure AI_GATEWAY_API_KEY environment variable'
    });
  }

  try {
    // Fetch real balance from Vercel AI Gateway
    const response = await fetch('https://ai-gateway.vercel.sh/v1/credits', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Gateway API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Return the real balance from Vercel AI Gateway
    return res.status(200).json({
      credits: parseFloat(data.balance) || 0,
      total_used: parseFloat(data.total_used) || 0,
      currency: 'USD',
      updated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching credits from Vercel AI Gateway:', error);
    
    // Return error info for debugging
    return res.status(500).json({ 
      credits: 0,
      currency: 'USD',
      updated_at: new Date().toISOString(),
      error: 'Failed to fetch real balance',
      details: error.message
    });
  }
}