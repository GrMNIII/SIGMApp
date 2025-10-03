const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /cracks?projectId=1
router.get('/', (req, res) => {
  const { projectId } = req.query;
  try {
    const cracks = db.prepare('SELECT * FROM cracks WHERE project_id = ?').all(projectId);
    res.json(cracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /cracks/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const crack = db.prepare('SELECT * FROM cracks WHERE id = ?').get(id);
    if (!crack) return res.status(404).json({ error: 'Crack not found' });
    res.json(crack);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /cracks
router.post('/', (req, res) => {
  const crack = req.body; // Aquí recibes todo el objeto crack
  const columns = Object.keys(crack).join(', ');
  const placeholders = Object.keys(crack).map(() => '?').join(', ');
  try {
    const stmt = db.prepare(`INSERT INTO cracks(${columns}) VALUES (${placeholders})`);
    stmt.run(...Object.values(crack));
    const newCrack = db.prepare('SELECT * FROM cracks WHERE id = ?').get(crack.id);
    res.status(201).json(newCrack);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
