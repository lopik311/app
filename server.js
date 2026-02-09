const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data/users');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const locks = new Map();

function withLock(id, fn) {
  const prev = locks.get(id) || Promise.resolve();
  const next = prev.then(fn).catch(console.error);
  locks.set(id, next);
  return next;
}

function userFile(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

function loadUser(id) {
  if (!fs.existsSync(userFile(id))) {
    return {
      tgId: id,
      createdAt: new Date().toISOString(),
      profile: { points: 0, streak: 0, bestStreak: 0, achievements: [] },
      tasks: [],
      activeSession: null,
      sessions: []
    };
  }
  return JSON.parse(fs.readFileSync(userFile(id)));
}

function saveUser(id, data) {
  const tmp = userFile(id) + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, userFile(id));
}

function requireTg(req, res, next) {
  const tgId = req.query.tgId || req.body.tgId;
  if (!tgId) return res.status(400).json({ error: 'tgId required' });
  req.tgId = String(tgId);
  next();
}

app.get('/api/state', requireTg, (req, res) => {
  res.json(loadUser(req.tgId));
});

app.post('/api/session/start', requireTg, (req, res) => {
  withLock(req.tgId, () => {
    const u = loadUser(req.tgId);
    u.activeSession = {
      id: crypto.randomUUID(),
      durationMin: req.body.durationMin,
      startTs: Date.now(),
      lostSecTotal: 0,
      interruptions: [],
      status: 'running'
    };
    saveUser(req.tgId, u);
    res.json(u.activeSession);
  });
});

app.post('/api/session/finish', requireTg, (req, res) => {
  withLock(req.tgId, () => {
    const u = loadUser(req.tgId);
    if (!u.activeSession) return res.json({});
    const s = u.activeSession;
    s.endTs = Date.now();
    s.status = 'completed';
    u.sessions.push(s);
    u.activeSession = null;
    saveUser(req.tgId, u);
    res.json(s);
  });
});

app.listen(3000, () =>
  console.log('✅ Server running: http://localhost:3000')
);
