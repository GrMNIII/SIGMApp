import db from './db';

export const projectService = {
  // Obtener todos los proyectos
  getAll: () => {
    return db.getAllSync('SELECT * FROM projects ORDER BY id DESC');
  },

  // Obtener un proyecto por ID
  getById: (id: number) => {
    return db.getFirstSync('SELECT * FROM projects WHERE id = ?', [id]);
  },

  // Crear un proyecto
  create: (name: string, description?: string) => {
    const result = db.runSync(
      'INSERT INTO projects (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    return result.lastInsertRowId;
  },

  // Actualizar un proyecto
  update: (id: number, name: string, description?: string) => {
    db.runSync(
      'UPDATE projects SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
  },

  // Eliminar un proyecto
  delete: (id: number) => {
    db.runSync('DELETE FROM projects WHERE id = ?', [id]);
  },
};