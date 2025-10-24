import db from "./db";

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
      crack_id, fecha, hora, lectura_x, lectura_y, medida_a, medida_b, observaciones, foto,
      nombre_inspector, ambiente_temperatura_C, ambiente_hr_percent, ambiente_clima,
      operacion_equipo_en_servicio, operacion_vibraciones, integridad
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        readingData.crack_id,
        readingData.fecha,
        readingData.hora,
        readingData.lectura_x,
        readingData.lectura_y,
        readingData.medida_a,
        readingData.medida_b,
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
  // Actualizar un registro
  update: (id: number, readingData: any) => {
    db.runSync(
      `UPDATE readings 
       SET 
         fecha = ?,
         hora = ?,
         nombre_inspector = ?,
         lectura_x = ?,
         lectura_y = ?,
         medida_a = ?,
         medida_b = ?,
         ambiente_temperatura_C = ?,
         ambiente_hr_percent = ?,
         ambiente_clima = ?,
         operacion_equipo_en_servicio = ?,
         operacion_vibraciones = ?,
         integridad = ?,
         observaciones = ?,
         foto = ?
       WHERE id = ?`,
      [
        readingData.fecha,
        readingData.hora,
        readingData.nombre_inspector,
        readingData.lectura_x,
        readingData.lectura_y,
        readingData.medida_a,
        readingData.medida_b,
        readingData.ambiente_temperatura_C,
        readingData.ambiente_hr_percent,
        readingData.ambiente_clima,
        readingData.operacion_equipo_en_servicio,
        readingData.operacion_vibraciones,
        readingData.integridad,
        readingData.observaciones,
        readingData.foto,
        id,
      ]
    );
  },
  
};
