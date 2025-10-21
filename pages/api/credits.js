import { API_CONFIG } from '../../utils/config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;

  try {
    // Return static balance for now
    // The Vercel AI Gateway API endpoint for balance is not publicly documented
    // Future enhancement: implement real balance fetching when API is available
    return res.status(200).json({
      credits: API_CONFIG.DEFAULT_CREDITS,
      currency: API_CONFIG.CREDITS_CURRENCY,
      updated_at: new Date().toISOString(),
      static: !apiKey
    });

  } catch (error) {
    console.error('Error fetching credits:', error);

    // Fallback to default balance on error
    return res.status(200).json({
      credits: API_CONFIG.DEFAULT_CREDITS,
      currency: API_CONFIG.CREDITS_CURRENCY,
      updated_at: new Date().toISOString(),
      fallback: true
    });
  }
}
