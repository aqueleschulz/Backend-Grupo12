import pool from '../db/pool.js';

const executor = (client) => client ?? pool;

export const AlunoRepository = {
  async findByUsuarioId(usuarioId, { client } = {}) {
    if (!usuarioId) {
      return null;
    }

    const db = executor(client);
    const result = await db.query(
      `
        SELECT id, ra
        FROM aluno
        WHERE id = $1
      `,
      [usuarioId],
    );

    return result.rows[0] ?? null;
  },
};

export default AlunoRepository;
