import pool from '../db/pool.js';

const executor = (client) => client ?? pool;

export const DisciplinaRepository = {
  async findById(disciplinaId, { client } = {}) {
    if (!disciplinaId) {
      return null;
    }

    const db = executor(client);
    const result = await db.query(
      `
        SELECT id, codigo, nome, creditos
        FROM disciplina
        WHERE id = $1
      `,
      [disciplinaId],
    );

    return result.rows[0] ?? null;
  },

  async findByCodigo(codigo, { client } = {}) {
    if (!codigo) {
      return null;
    }

    const db = executor(client);
    const result = await db.query(
      `
        SELECT id, codigo, nome, creditos
        FROM disciplina
        WHERE codigo = $1
      `,
      [codigo],
    );

    return result.rows[0] ?? null;
  },

  async findAll({ client } = {}) {
    const db = executor(client);
    const result = await db.query(
      `
        SELECT id, codigo, nome, creditos
        FROM disciplina
        ORDER BY codigo
      `,
    );

    return result.rows;
  },
};

export default DisciplinaRepository;

