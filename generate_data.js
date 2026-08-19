const fs = require('fs');
const encrypted = fs.readFileSync('encrypted_payload.txt', 'utf8');
const dataJs = `export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = "${encrypted}";

  return res.status(200).json({
    encrypted: true,
    data: payload
  });
}`;
fs.writeFileSync('pages/api/data.js', dataJs);
console.log('Updated data.js!');
