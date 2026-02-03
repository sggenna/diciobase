/**
 * Demo backend - no database, no cost.
 * Serves static toponym data from demo-data.json for showcasing DicioBase.
 * Run: node server-demo.js
 * Then open the app (npm start) - it will use http://localhost:3001
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Load demo data once at startup
const demoDataPath = path.join(__dirname, 'demo-data.json');
let toponyms = [];

try {
  const raw = fs.readFileSync(demoDataPath, 'utf8');
  const data = JSON.parse(raw);
  toponyms = data.toponyms || [];
  console.log(`Demo backend: loaded ${toponyms.length} toponyms from demo-data.json`);
} catch (err) {
  console.error('Could not load demo-data.json:', err.message);
  toponyms = [
    { idverbete: 1, lema: 'Paranaguá', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
    { idverbete: 2, lema: 'Araguaia', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  ];
}

app.use(cors());
app.use(express.json());

// Routes match what DicioBase.tsx expects (no /api prefix)
app.get('/toponyms', (req, res) => {
  res.json({ success: true, data: toponyms });
});

app.get('/searchToponyms', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({ success: true, data: toponyms });
  }
  const filtered = toponyms.filter(
    (t) =>
      (t.lema && t.lema.toLowerCase().includes(q)) ||
      (t.categoria_gramatical && t.categoria_gramatical.toLowerCase().includes(q)) ||
      (t.estrutura_morfologica && t.estrutura_morfologica.toLowerCase().includes(q))
  );
  res.json({ success: true, data: filtered });
});

// Pronunciation API: proxy free TTS (pt-BR) so the demo can play audio without CORS
app.get('/pronunciation', async (req, res) => {
  const lema = (req.query.lema || '').trim();
  if (!lema) {
    return res.status(400).json({ success: false, message: 'Missing lema' });
  }
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=${encodeURIComponent(lema)}`;
  try {
    const response = await fetch(ttsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0' },
    });
    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'TTS unavailable' });
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('audio')) {
      return res.status(502).json({ success: false, message: 'TTS unavailable' });
    }
    res.setHeader('Content-Type', contentType);
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Pronunciation proxy error:', err.message);
    res.status(502).json({ success: false, message: 'Pronunciation service error' });
  }
});

// Optional: serve built React app when running as single process
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Demo backend running at http://localhost:${PORT}`);
  console.log('  GET /toponyms');
  console.log('  GET /searchToponyms?q=...');
  console.log('  GET /pronunciation?lema=...');
});
