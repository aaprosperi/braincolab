export default async function handler(req, res) {
  // For now, return a mock balance
  // In production, this would fetch from Vercel AI Gateway API
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock response - replace with actual API call to Vercel
    // const response = await fetch('https://api.vercel.com/v1/ai-gateway/credits', {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.AI_GATEWAY_API_KEY}`
    //   }
    // });
    
    return res.status(200).json({
      credits: 10.00,  // Mock balance
      currency: 'USD',
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch credits',
      credits: 0 
    });
  }
}