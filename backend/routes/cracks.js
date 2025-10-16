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
  const crack = req.body;
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

// PUT /cracks/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const crack = req.body;
  const columns = Object.keys(crack).map((key) => `${key} = ?`).join(', ');
  try {
    const stmt = db.prepare(`UPDATE cracks SET ${columns} WHERE id = ?`);
    stmt.run(...Object.values(crack), id);
    const updatedCrack = db.prepare('SELECT * FROM cracks WHERE id = ?').get(id);
    res.status(200).json(updatedCrack);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /cracks/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM cracks WHERE id = ?');
    stmt.run(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * NUEVO ENDPOINT DE EXPORTACIÓN: GET /cracks/export
 * Exporta todos los proyectos a un archivo CSV.
 */
router.get('/export', (req, res) => {
  try {
      // Consultar todos los datos de la tabla 'cracks'
      const data = db.prepare('SELECT * FROM cracks').all();

      if (data.length === 0) {
          return res.status(404).send("No se encontraron cracks para exportar.");
      }

      // Convertir JSON (array de objetos) a CSV
      const json2csvParser = new Parser({});
      const csv = json2csvParser.parse(data);

      // Configuración de los encabezados para forzar la descarga
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=cracks_registrados.csv');
      
      // Envía el contenido CSV
      res.status(200).send(csv);

  } catch (error) {
      console.error("Error al exportar cracks a CSV:", error);
      res.status(500).send("Error interno del servidor al procesar la exportación de cracks.");
  }
});

module.exports = router;
