const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /projects
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM projects').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /projects
router.post('/', (req, res) => {
  try {
    const { name, description } = req.body;
    const stmt = db.prepare('INSERT INTO projects(name, description) VALUES (?, ?)');
    const info = stmt.run(name, description);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
