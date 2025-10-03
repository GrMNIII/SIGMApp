const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /readings?crackId=...
router.get('/', (req, res) => {
  const { crackId } = req.query;
  try {
    const readings = db.prepare('SELECT * FROM readings WHERE crack_id = ?').all(crackId);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /readings
router.post('/', (req, res) => {
  const reading = req.body;
  const columns = Object.keys(reading).join(', ');
  const placeholders = Object.keys(reading).map(() => '?').join(', ');
  try {
    const stmt = db.prepare(`INSERT INTO readings(${columns}) VALUES (${placeholders})`);
    const info = stmt.run(...Object.values(reading));
    const newReading = db.prepare('SELECT * FROM readings WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newReading);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
