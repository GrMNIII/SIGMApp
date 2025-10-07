const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "grietas.db"));

const initSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
);
CREATE TABLE IF NOT EXISTS cracks (
    id TEXT PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    edificio_area TEXT,
    nivel_cota TEXT,
    muro TEXT,
    cara TEXT,
    gps_lat REAL,
    gps_lon REAL,
    elemento_tipo TEXT,
    elemento_material TEXT,
    elemento_espesor_cm REAL,
    grieta_orientacion TEXT,
    grieta_longitud_visible_m REAL,
    grieta_ancho_inicial_mm REAL,
    grieta_clasificacion_preliminar TEXT,
    instrumentacion_modelo TEXT,
    instrumentacion_n_serie TEXT,
    instrumentacion_resolucion_mm REAL,
    instrumentacion_eje_x REAL,
    instrumentacion_eje_y REAL,
    instrumentacion_lectura_cero REAL,
    instrumentacion_adhesivo TEXT,
    instalacion_fecha TEXT,
    instalacion_hora TEXT,
    instalacion_instalador TEXT,
    instalacion_foto TEXT,
    instalacion_observaciones TEXT,
    umbral_verde_mm_sem REAL,
    umbral_amarillo_mm_scm REAL,
    umbral_rojo_mm_scm REAL,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crack_id TEXT NOT NULL,
    fecha TEXT,
    hora TEXT,
    nombre_inspector TEXT,
    lectura_x REAL,
    lectura_y REAL,
    ambiente_temperatura_C REAL,
    ambiente_hr_percent REAL,
    ambiente_clima TEXT,
    operacion_equipo_en_servicio INTEGER,
    operacion_vibraciones INTEGER,
    integridad TEXT,
    observaciones TEXT,
    FOREIGN KEY(crack_id) REFERENCES cracks(id) ON DELETE CASCADE
);
`;
db.exec(initSql);
module.exports = db;
