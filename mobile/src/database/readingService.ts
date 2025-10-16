import db from "./db";

try { db.runSync(`ALTER TABLE readings ADD COLUMN nombre_inspector TEXT;`); } catch {}
try { db.runSync(`ALTER TABLE readings ADD COLUMN ambiente_temperatura_C REAL;`); } catch {}
try { db.runSync(`ALTER TABLE readings ADD COLUMN ambiente_hr_percent REAL;`); } catch {}
try { db.runSync(`ALTER TABLE readings ADD COLUMN ambiente_clima TEXT;`); } catch {}
try { db.runSync(`ALTER TABLE readings ADD COLUMN operacion_equipo_en_servicio INTEGER;`); } catch {}
try { db.runSync(`ALTER TABLE readings ADD COLUMN operacion_vibraciones INTEGER;`); } catch {}
try { db.runSync(`ALTER TABLE readings ADD COLUMN integridad TEXT;`); } catch {}

export const readingService = {
  // Obtener todos los registros
  getAll: () => {
    return db.getAllSync(
      "SELECT * FROM readings ORDER BY fecha DESC, hora DESC"
    );
  },

  // Obtener registros por grieta
  getByCrack: (crackId: string) => {
    return db.getAllSync(
      "SELECT * FROM readings WHERE crack_id = ? ORDER BY fecha DESC, hora DESC",
      [crackId]
    );
  },

  // Obtener un registro por ID
  getById: (id: number) => {
    return db.getFirstSync("SELECT * FROM readings WHERE id = ?", [id]);
  },

  // Crear un registro
  create: (readingData: any) => {
    const result = db.runSync(
      `INSERT INTO readings (
      crack_id, fecha, hora, lectura_x, lectura_y, observaciones, foto,
      nombre_inspector, ambiente_temperatura_C, ambiente_hr_percent, ambiente_clima,
      operacion_equipo_en_servicio, operacion_vibraciones, integridad
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        readingData.crack_id,
        readingData.fecha,
        readingData.hora,
        readingData.lectura_x,
        readingData.lectura_y,
        readingData.observaciones,
        readingData.foto,
        readingData.nombre_inspector,
        readingData.ambiente_temperatura_C,
        readingData.ambiente_hr_percent,
        readingData.ambiente_clima,
        readingData.operacion_equipo_en_servicio,
        readingData.operacion_vibraciones,
        readingData.integridad,
      ]
    );
    return result.lastInsertRowId;
  },

  // Eliminar un registro
  delete: (id: number) => {
    db.runSync("DELETE FROM readings WHERE id = ?", [id]);
  },
};
