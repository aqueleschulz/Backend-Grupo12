import pool from '../db/pool.js';

const executor = (client) => client ?? pool;

export const AlunoRepository = {
  async findByUsuarioId(usuarioId, { client } = {}) {
    if (!usuarioId) {
      return null;
    }

    const pool = executor(client);
    const result = await pool.query(
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
