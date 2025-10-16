const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');

router.get('/export/complete', async (req, res) => {
    try {
        // Obtener todos los datos de las 3 tablas
        const projects = db.prepare('SELECT * FROM projects').all();
        const cracks = db.prepare('SELECT * FROM cracks').all();
        const readings = db.prepare('SELECT * FROM readings').all();

        // Crear un nuevo workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'SIGMApp';
        workbook.created = new Date();

        // === HOJA 1: PROYECTOS ===
        const projectsSheet = workbook.addWorksheet('Proyectos');
        
        if (projects.length > 0) {
            // Obtener las columnas del primer registro
            const projectColumns = Object.keys(projects[0]).map(key => ({
                header: key.toUpperCase(),
                key: key,
                width: 20
            }));
            
            projectsSheet.columns = projectColumns;
            
            // Agregar los datos
            projects.forEach(project => {
                projectsSheet.addRow(project);
            });

            // Estilo del encabezado
            projectsSheet.getRow(1).font = { bold: true };
            projectsSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF007BFF' }
            };
            projectsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        }

        // === HOJA 2: GRIETAS ===
        const cracksSheet = workbook.addWorksheet('Grietas');
        
        if (cracks.length > 0) {
            const crackColumns = Object.keys(cracks[0]).map(key => ({
                header: key.toUpperCase(),
                key: key,
                width: 20
            }));
            
            cracksSheet.columns = crackColumns;
            
            cracks.forEach(crack => {
                cracksSheet.addRow(crack);
            });

            // Estilo del encabezado
            cracksSheet.getRow(1).font = { bold: true };
            cracksSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF28A745' }
            };
            cracksSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        }

        // === HOJA 3: REGISTROS ===
        const readingsSheet = workbook.addWorksheet('Registros');
        
        if (readings.length > 0) {
            const readingColumns = Object.keys(readings[0]).map(key => ({
                header: key.toUpperCase(),
                key: key,
                width: 20
            }));
            
            readingsSheet.columns = readingColumns;
            
            readings.forEach(reading => {
                readingsSheet.addRow(reading);
            });

            // Estilo del encabezado
            readingsSheet.getRow(1).font = { bold: true };
            readingsSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFC107' }
            };
            readingsSheet.getRow(1).font = { bold: true, color: { argb: 'FF000000' } };
        }

        // Configurar headers de respuesta
        const fileName = `datos_completos_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`
        );

        // Escribir el archivo y enviarlo
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error en exportación completa:', error);
        res.status(500).json({ 
            error: 'Error al generar exportación completa',
            details: error.message 
        });
    }
});

module.exports = router;