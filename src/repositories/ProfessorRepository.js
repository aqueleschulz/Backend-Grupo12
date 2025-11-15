import pool from '../db/pool.js';

const executor = (client) => client ?? pool;

export const ProfessorRepository = {
  async findById(professorId, { client } = {}) {
    if (!professorId) {
      return null;
    }

    const db = executor(client);
    const result = await db.query(
      `
        SELECT p.id, p.siape, u.nome, u.email
        FROM professor p
        JOIN usuario u ON u.id = p.id
        WHERE p.id = $1
      `,
      [professorId],
    );

    return result.rows[0] ?? null;
  },

  async findByUsuarioId(usuarioId, { client } = {}) {
    if (!usuarioId) {
      return null;
    }

    const db = executor(client);
    const result = await db.query(
      `
        SELECT p.id, p.siape, u.nome, u.email
        FROM professor p
        JOIN usuario u ON u.id = p.id
        WHERE p.id = $1
      `,
      [usuarioId],
    );

    return result.rows[0] ?? null;
  },
};

export default ProfessorRepository;

