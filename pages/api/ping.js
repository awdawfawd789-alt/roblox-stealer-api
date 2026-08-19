export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, status, playerCount, items } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Missing sessionId' });
  }

  // Here is where you would update the database record for this session.
  console.log(`[*] Status update for ${sessionId}: ${status}`);

  return res.status(200).json({
    success: true
  });
}
