import pool from '../db/pool.js';

const executor = (client) => client ?? pool;

const TURMA_BASE_QUERY = `
  SELECT
    id,
    codigo,
    disciplina_id,
    professor_id,
    vagas::int AS vagas,
    dia::int   AS dia,
    turno::int AS turno,
    (dia::text || turno::text) AS horario_codigo
  FROM turma
`;

export const TurmaRepository = {
  async findById(turmaId, { client, forUpdate = false } = {}) {
    if (!turmaId) {
      return null;
    }

    const db = executor(client);
    const result = await db.query(
      `
        ${TURMA_BASE_QUERY}
        WHERE id = $1
        ${forUpdate ? 'FOR UPDATE' : ''}
      `,
      [turmaId],
    );

    return result.rows[0] ?? null;
  },

  getHorarioCodigo(turma) {
    if (!turma) return null;
    if (turma.horario_codigo) return turma.horario_codigo;

    const hasDia = turma.dia !== null && turma.dia !== undefined;
    const hasTurno = turma.turno !== null && turma.turno !== undefined;
    if (hasDia && hasTurno) return `${turma.dia}${turma.turno}`;

    return null;
  },
};

export default TurmaRepository;
