export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch credits from Vercel AI Gateway
    const response = await fetch('https://ai-gateway.vercel.sh/v1/credits', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch credits: ${response.status}`);
    }

    const data = await response.json();
    
    // The API returns credits in different formats, we'll handle both
    const credits = data.credits || data.balance || data.remaining || 0;
    
    return res.status(200).json({ 
      credits: credits,
      raw: data // Send raw data for debugging
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch credits',
      details: error.message 
    });
  }
}