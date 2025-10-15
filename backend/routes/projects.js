const express = require('express');
const router = express.Router();
const db = require('../db');
const { Parser } = require('json2csv');

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

/**
 * NUEVO ENDPOINT DE EXPORTACIÓN: GET /projects/export
 * Exporta todos los proyectos a un archivo CSV.
 */
router.get('/export', (req, res) => {
    try {
        // Consultar todos los datos de la tabla 'projects'
        const data = db.prepare('SELECT * FROM projects').all();

        if (data.length === 0) {
            return res.status(404).send("No se encontraron proyectos para exportar.");
        }

        // Convertir JSON (array de objetos) a CSV
        const json2csvParser = new Parser({});
        const csv = json2csvParser.parse(data);

        // Configuración de los encabezados para forzar la descarga
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=proyectos_registrados.csv');
        
        // Envía el contenido CSV
        res.status(200).send(csv);

    } catch (error) {
        console.error("Error al exportar proyectos a CSV:", error);
        res.status(500).send("Error interno del servidor al procesar la exportación de proyectos.");
    }
});

module.exports = router;
