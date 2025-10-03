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

// PUT /projects/id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const stmt = db.prepare('UPDATE projects SET name = ?, description = ? WHERE id = ?');
    stmt.run(name, description, id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /projects/id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
