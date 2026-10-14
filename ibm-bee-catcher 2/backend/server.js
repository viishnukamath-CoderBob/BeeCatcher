const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { getDB, saveDB } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getTier(score) {
  const db = getDB();
  const tiers = [...db.config.tiers].sort((a, b) => b.minScore - a.minScore);
  return tiers.find(t => score >= t.minScore) || tiers[tiers.length - 1];
}

function calcRank(players, playerId) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const idx = sorted.findIndex(p => p.id === playerId);
  return idx + 1;
}

function checkAdmin(req, res) {
  const db = getDB();
  const key = req.headers['x-admin-key'] || req.body?.adminKey;
  if (key !== db.config.adminPassword) {
    res.status(401).json({ error: 'Unauthorised' });
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────
// PUBLIC – CONFIG & CONTENT
// ─────────────────────────────────────────────

// GET /api/config  – game settings (no secrets)
app.get('/api/config', (req, res) => {
  const { adminPassword, ...pub } = getDB().config;
  res.json(pub);
});

// GET /api/content  – IBM facts shown between levels
app.get('/api/content', (req, res) => {
  const facts = [...getDB().content.facts].sort(() => Math.random() - 0.5);
  res.json({ facts });
});

// ─────────────────────────────────────────────
// PUBLIC – GAME SESSION
// ─────────────────────────────────────────────

// POST /api/session/start
// body: { playerName, email? }
app.post('/api/session/start', (req, res) => {
  const { playerName, email } = req.body;
  if (!playerName || !playerName.trim()) {
    return res.status(400).json({ error: 'playerName is required' });
  }
  const db = getDB();
  const sessionId = uuidv4();
  db.sessions[sessionId] = {
    playerName: playerName.trim(),
    email: email || '',
    startedAt: Date.now(),
    submitted: false,
  };
  saveDB();
  res.json({ sessionId });
});

// POST /api/session/submit
// body: { sessionId, catchScore, bonusScore, caught, bestStreak, level }
app.post('/api/session/submit', (req, res) => {
  const { sessionId, catchScore, bonusScore, caught, bestStreak, level } = req.body;
  const db = getDB();
  const session = db.sessions[sessionId];
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.submitted) return res.status(409).json({ error: 'Already submitted' });

  // Light sanity caps only. Scores come from the browser, so this is fine for an event
  // but not tamper-proof; delete suspicious entries from the Admin panel.
  const clamp = (v, lo, hi) => Math.min(Math.max(Number(v) || 0, lo), hi);
  const safe = Math.max(
    0,
    Math.round(clamp(catchScore, 0, 200000) + clamp(bonusScore, 0, 200000))
  );

  const player = {
    id: uuidv4(),
    name: session.playerName,
    email: session.email,
    score: safe,
    catchScore: Number(catchScore) || 0,
    bonusScore: Number(bonusScore) || 0,
    caught: clamp(caught, 0, 1000),
    bestStreak: clamp(bestStreak, 0, 1000),
    level: clamp(level, 1, 50) || 1,
    playedAt: new Date().toISOString(),
    claimed: false,
  };

  player.tier = getTier(safe);
  db.players.push(player);
  session.submitted = true;
  saveDB();

  const rank = calcRank(db.players, player.id);
  res.json({ player, rank, totalPlayers: db.players.length });
});

// ─────────────────────────────────────────────
// PUBLIC – LEADERBOARD
// ─────────────────────────────────────────────

// GET /api/leaderboard?limit=20&offset=0
app.get('/api/leaderboard', (req, res) => {
  const db = getDB();
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;

  const sorted = [...db.players]
    .sort((a, b) => b.score - a.score)
    .slice(offset, offset + limit)
    .map((p, i) => ({
      rank: offset + i + 1,
      name: p.name,
      score: p.score,
      level: p.level,
      tier: p.tier,
      playedAt: p.playedAt,
    }));

  res.json({ players: sorted, total: db.players.length });
});

// GET /api/leaderboard/stats
app.get('/api/leaderboard/stats', (req, res) => {
  const db = getDB();
  if (db.players.length === 0) return res.json({ count: 0 });
  const scores = db.players.map(p => p.score);
  const top = db.players.reduce((a, b) => (a.score > b.score ? a : b));
  res.json({
    count: db.players.length,
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    topScore: top.score,
    topPlayer: top.name,
    tierBreakdown: db.config.tiers.map(t => ({
      ...t,
      count: db.players.filter(p => p.tier?.id === t.id).length,
    })),
  });
});

// ─────────────────────────────────────────────
// ADMIN ENDPOINTS  (require x-admin-key header)
// ─────────────────────────────────────────────

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  if (!checkAdmin(req, res)) return;
  res.json({ ok: true });
});

// GET /api/admin/players  – full player list with email and claimed status
app.get('/api/admin/players', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const db = getDB();
  const sorted = [...db.players].sort((a, b) => b.score - a.score);
  res.json({ players: sorted, total: sorted.length });
});

// PATCH /api/admin/players/:id  – mark prize claimed, edit score, rename
app.patch('/api/admin/players/:id', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const db = getDB();
  const player = db.players.find(p => p.id === req.params.id);
  if (!player) return res.status(404).json({ error: 'Not found' });

  if (typeof req.body.claimed === 'boolean') player.claimed = req.body.claimed;
  if (typeof req.body.score === 'number') {
    player.score = req.body.score;
    player.tier = getTier(req.body.score);
  }
  if (typeof req.body.name === 'string' && req.body.name.trim()) {
    player.name = req.body.name.trim();
  }
  saveDB();
  res.json({ player });
});

// DELETE /api/admin/players/:id
app.delete('/api/admin/players/:id', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const db = getDB();
  const idx = db.players.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.players.splice(idx, 1);
  saveDB();
  res.json({ ok: true });
});

// DELETE /api/admin/players  – wipe entire leaderboard
app.delete('/api/admin/players', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const db = getDB();
  db.players = [];
  db.sessions = {};
  saveDB();
  res.json({ ok: true });
});

// GET /api/admin/config
app.get('/api/admin/config', (req, res) => {
  if (!checkAdmin(req, res)) return;
  res.json(getDB().config);
});

// PUT /api/admin/config  – update event config
app.put('/api/admin/config', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const db = getDB();
  const allowed = ['eventName', 'tagline', 'gameDuration', 'tiers', 'adminPassword'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) db.config[key] = req.body[key];
  }
  // Re-evaluate every player's tier against the (possibly changed) tier table
  if (req.body.tiers) db.players.forEach(p => { p.tier = getTier(p.score); });
  saveDB();
  res.json({ ok: true });
});

// GET /api/admin/content  – raw (unshuffled) facts for editing
app.get('/api/admin/content', (req, res) => {
  if (!checkAdmin(req, res)) return;
  res.json(getDB().content);
});

// PUT /api/admin/content  – update facts
app.put('/api/admin/content', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const db = getDB();
  if (req.body.facts) db.content.facts = req.body.facts;
  saveDB();
  res.json({ ok: true });
});

// ─────────────────────────────────────────────
// CATCH-ALL  – SPA fallback
// ─────────────────────────────────────────────
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`\n🐝  IBM Bee Catcher server running at http://localhost:${PORT}`);
  console.log(`   Admin panel → http://localhost:${PORT}/admin.html`);
  console.log(`   Leaderboard → http://localhost:${PORT}/leaderboard.html\n`);
});
