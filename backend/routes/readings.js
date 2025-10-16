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

// PUT /readings/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const reading = req.body;
  const columns = Object.keys(reading).map((key) => `${key} = ?`).join(', ');
  try {
    const stmt = db.prepare(`UPDATE readings SET ${columns} WHERE id = ?`);
    stmt.run(...Object.values(reading), id);
    const updatedReading = db.prepare('SELECT * FROM readings WHERE id = ?').get(id);
    res.status(200).json(updatedReading);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /reagins/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM readings WHERE id = ?');
    stmt.run(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * NUEVO ENDPOINT DE EXPORTACIÓN: GET /readings/export
 * Exporta todos los proyectos a un archivo CSV.
 */
router.get('/export', (req, res) => {
    try {
        // Consultar todos los datos de la tabla 'readings'
        const data = db.prepare('SELECT * FROM readings').all();

        if (data.length === 0) {
            return res.status(404).send("No se encontraron readings para exportar.");
        }

        // Convertir JSON (array de objetos) a CSV
        const json2csvParser = new Parser({});
        const csv = json2csvParser.parse(data);

        // Configuración de los encabezados para forzar la descarga
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=readings_registrados.csv');
        
        // Envía el contenido CSV
        res.status(200).send(csv);

    } catch (error) {
        console.error("Error al exportar readings a CSV:", error);
        res.status(500).send("Error interno del servidor al procesar la exportación de readings.");
    }
});

module.exports = router;
