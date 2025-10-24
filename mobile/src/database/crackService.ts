import db from './db';

// --- INTERFAZ CRACKDATA DEFINIDA AQUÍ ---
export interface CrackData {
    id: string;
    project_id: number;
    name: string;

    edificio_area: string | null; 
    nivel_cota: string | null;
    muro: string | null;
    cara: string | null;
    gps_lat: number | null;
    gps_lon: number | null;
    elemento_tipo: string | null;
    elemento_material: string | null;
    elemento_espesor_cm: number | null;

    grieta_orientacion: string | null;
    grieta_longitud_visible_m: number | null;
    grieta_ancho_inicial_mm: number | null;
    grieta_clasificacion_preliminar: string | null;

    instrumentacion_modelo: string | null;
    instrumentacion_n_serie: string | null;
    instrumentacion_resolucion_mm: number | null;
    instrumentacion_eje_x: number | null;
    instrumentacion_eje_y: number | null;
    instrumentacion_lectura_cero: number | null;
    instrumentacion_adhesivo: string | null;
    instrumentacion_medida_a: number | null;
    instrumentacion_medida_b: number | null;

    instalacion_fecha: string | null;
    instalacion_hora: string | null;
    instalacion_instalador: string | null;
    instalacion_foto: string | null;
    instalacion_observaciones: string | null;

    umbral_verde_mm_sem: number | null;
    umbral_amarillo_mm_scm: number | null;
    umbral_rojo_mm_scm: number | null;
}

export const crackService = {
  getAll: (): CrackData[] => {
    return db.getAllSync('SELECT * FROM cracks ORDER BY name') as CrackData[];
  },

  getByProject: (projectId: number): CrackData[] => {
    return db.getAllSync(
      'SELECT * FROM cracks WHERE project_id = ? ORDER BY name',
      [projectId]
    ) as CrackData[];
  },

  getById: (id: string): CrackData | null => {
    const result = db.getFirstSync('SELECT * FROM cracks WHERE id = ?', [id]);
    return result ? (result as CrackData) : null;
  },

  exists: (id: string) => {
    const result = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM cracks WHERE id = ?',
      [id]
    );
    return result && result.count > 0;
  },

  create: (crackData: CrackData) => {
    const query = `
      INSERT INTO cracks (
        id, project_id, name, edificio_area, nivel_cota, muro, cara,
        gps_lat, gps_lon, elemento_tipo, elemento_material, elemento_espesor_cm,
        grieta_orientacion, grieta_longitud_visible_m, grieta_ancho_inicial_mm,
        grieta_clasificacion_preliminar, instrumentacion_modelo, instrumentacion_n_serie,
        instrumentacion_resolucion_mm, instrumentacion_eje_x, instrumentacion_eje_y,
        instrumentacion_lectura_cero, instrumentacion_adhesivo, instrumentacion_medida_a, instrumentacion_medida_b, instalacion_fecha,
        instalacion_hora, instalacion_instalador, instalacion_foto, instalacion_observaciones,
        umbral_verde_mm_sem, umbral_amarillo_mm_scm, umbral_rojo_mm_scm
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.runSync(query, [
      crackData.id,
      crackData.project_id,
      crackData.name,
      crackData.edificio_area,
      crackData.nivel_cota,
      crackData.muro,
      crackData.cara,
      crackData.gps_lat,
      crackData.gps_lon,
      crackData.elemento_tipo,
      crackData.elemento_material,
      crackData.elemento_espesor_cm,
      crackData.grieta_orientacion,
      crackData.grieta_longitud_visible_m,
      crackData.grieta_ancho_inicial_mm,
      crackData.grieta_clasificacion_preliminar,
      crackData.instrumentacion_modelo,
      crackData.instrumentacion_n_serie,
      crackData.instrumentacion_resolucion_mm,
      crackData.instrumentacion_eje_x,
      crackData.instrumentacion_eje_y,
      crackData.instrumentacion_lectura_cero,
      crackData.instrumentacion_adhesivo,
      crackData.instrumentacion_medida_a,
      crackData.instrumentacion_medida_b,
      crackData.instalacion_fecha,
      crackData.instalacion_hora,
      crackData.instalacion_instalador,
      crackData.instalacion_foto,
      crackData.instalacion_observaciones,
      crackData.umbral_verde_mm_sem,
      crackData.umbral_amarillo_mm_scm,
      crackData.umbral_rojo_mm_scm,
    ]);
  },

  update: (id: string, crackData: CrackData) => {
    const query = `
      UPDATE cracks SET
        name = ?, edificio_area = ?, nivel_cota = ?, muro = ?, cara = ?,
        gps_lat = ?, gps_lon = ?, elemento_tipo = ?, elemento_material = ?,
        elemento_espesor_cm = ?, grieta_orientacion = ?, grieta_longitud_visible_m = ?,
        grieta_ancho_inicial_mm = ?, grieta_clasificacion_preliminar = ?,
        instrumentacion_modelo = ?, instrumentacion_n_serie = ?,
        instrumentacion_resolucion_mm = ?, instrumentacion_eje_x = ?,
        instrumentacion_eje_y = ?, instrumentacion_lectura_cero = ?,
        instrumentacion_adhesivo = ?, instrumentacion_medida_a = ?, instrumentacion_medida_b = ?,
        instalacion_fecha = ?, instalacion_hora = ?,
        instalacion_instalador = ?, instalacion_foto = ?, instalacion_observaciones = ?,
        umbral_verde_mm_sem = ?, umbral_amarillo_mm_scm = ?, umbral_rojo_mm_scm = ?
      WHERE id = ?
    `;

    db.runSync(query, [
      crackData.name,
      crackData.edificio_area,
      crackData.nivel_cota,
      crackData.muro,
      crackData.cara,
      crackData.gps_lat,
      crackData.gps_lon,
      crackData.elemento_tipo,
      crackData.elemento_material,
      crackData.elemento_espesor_cm,
      crackData.grieta_orientacion,
      crackData.grieta_longitud_visible_m,
      crackData.grieta_ancho_inicial_mm,
      crackData.grieta_clasificacion_preliminar,
      crackData.instrumentacion_modelo,
      crackData.instrumentacion_n_serie,
      crackData.instrumentacion_resolucion_mm,
      crackData.instrumentacion_eje_x,
      crackData.instrumentacion_eje_y,
      crackData.instrumentacion_lectura_cero,
      crackData.instrumentacion_adhesivo,
      crackData.instrumentacion_medida_a,
      crackData.instrumentacion_medida_b,
      crackData.instalacion_fecha,
      crackData.instalacion_hora,
      crackData.instalacion_instalador,
      crackData.instalacion_foto,
      crackData.instalacion_observaciones,
      crackData.umbral_verde_mm_sem,
      crackData.umbral_amarillo_mm_scm,
      crackData.umbral_rojo_mm_scm,
      id,
    ]);
  },

  delete: (id: string) => {
    db.runSync('DELETE FROM cracks WHERE id = ?', [id]);
  },
};
