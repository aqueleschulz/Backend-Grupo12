import pool from '../db/pool.js';

const executor = (client) => client ?? pool;

const isAtiva = (alias = 'm') =>
  `(${alias}.status IS NULL OR ${alias}.status = 'ATIVA')`;

export const MatriculaRepository = {
  async existsMatriculaAtivaDoAlunoNaTurma(alunoId, turmaId, { client } = {}) {
    const db = executor(client);
    const result = await db.query(
      `
        SELECT 1
        FROM matricula m
        WHERE m.aluno_id = $1
          AND m.turma_id = $2
          AND ${isAtiva('m')}
        LIMIT 1
      `,
      [alunoId, turmaId],
    );

    return Boolean(result.rowCount);
  },

  async countMatriculasAtivasNaTurma(turmaId, { client } = {}) {
    const db = executor(client);
    const result = await db.query(`
        SELECT COUNT(*)::int AS total
        FROM matricula m
        WHERE m.turma_id = $1
          AND (m.status IS NULL OR m.status = 'ATIVA')`,
      [turmaId],
    );
    return Number.parseInt(result.rows[0]?.total ?? 0, 10);
  },

  async listHorariosCodigoAtivosDoAluno(alunoId, { client } = {}) {
    const db = executor(client);
    const result = await db.query(
      `
        SELECT (t.dia::text || t.turno::text) AS horario_codigo
        FROM matricula m
        JOIN turma t ON t.id = m.turma_id
        WHERE m.aluno_id = $1
          AND ${isAtiva('m')}
      `,
      [alunoId],
    );

    return result.rows.map((row) => row.horario_codigo);
  },

  async insertMatricula({ alunoId, turmaId }, { client } = {}) {
    const db = executor(client);
    const result = await db.query(
      `
        INSERT INTO matricula (aluno_id, turma_id, status)
        VALUES ($1, $2, 'ATIVA')
        RETURNING id, aluno_id, turma_id, data, status
      `,
      [alunoId, turmaId],
    );

    return result.rows[0];
  },

  async findMatriculaDoAluno(matriculaId, alunoId, { client } = {}) {
    const db = executor(client);
    const result = await db.query(
      `
        SELECT id, aluno_id, turma_id, status, data
        FROM matricula
        WHERE id = $1
          AND aluno_id = $2
      `,
      [matriculaId, alunoId],
    );

    return result.rows[0] ?? null;
  },

  async cancelarMatricula(matriculaId, { client } = {}) {
    const db = executor(client);
    await db.query(
      `
        UPDATE matricula
        SET status = 'CANCELADA'
        WHERE id = $1
      `,
      [matriculaId],
    );
  },

  async listMatriculasDoAluno(alunoId, { client } = {}) {
    const db = executor(client);
    const result = await db.query(
      `
        SELECT
          m.id,
          m.aluno_id,
          m.turma_id,
          m.status,
          m.data,
          t.codigo AS turma_codigo,
          t.dia,
          t.turno,
          (t.dia::text || t.turno::text) AS horario_codigo,
          d.nome AS disciplina_nome,
          u.nome AS professor_nome
        FROM matricula m
        JOIN turma t ON t.id = m.turma_id
        JOIN disciplina d ON d.id = t.disciplina_id
        JOIN professor p ON p.id = t.professor_id
        JOIN usuario u ON u.id = p.id
        WHERE m.aluno_id = $1
        ORDER BY m.data DESC
      `,
      [alunoId],
    );

    return result.rows;
  },
};

export default MatriculaRepository;
