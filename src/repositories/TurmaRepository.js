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

const TURMA_LIST_QUERY = `
  SELECT
    t.id,
    t.codigo,
    t.disciplina_id,
    t.professor_id,
    t.vagas::int AS vagas,
    t.dia::int   AS dia,
    t.turno::int AS turno,
    (t.dia::text || t.turno::text) AS horario_codigo,
    d.codigo AS disciplina_codigo,
    d.nome AS disciplina_nome,
    d.creditos AS disciplina_creditos,
    u.nome AS professor_nome,
    p.siape AS professor_siape,
    COUNT(m.id) FILTER (WHERE m.status IS NULL OR m.status = 'ATIVA')::int AS matriculados
  FROM turma t
  JOIN disciplina d ON d.id = t.disciplina_id
  JOIN professor p ON p.id = t.professor_id
  JOIN usuario u ON u.id = p.id
  LEFT JOIN matricula m ON m.turma_id = t.id
  GROUP BY t.id, d.id, p.id, u.id
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

  async findAll({ client } = {}) {
    const db = executor(client);
    const result = await db.query(TURMA_LIST_QUERY + ' ORDER BY t.codigo');

    return result.rows;
  },

  async create({ codigo, vagas, dia, turno, disciplinaId, professorId }, { client } = {}) {
    const db = executor(client);
    const result = await db.query(
      `
        INSERT INTO turma (codigo, vagas, dia, turno, disciplina_id, professor_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, codigo, vagas, dia, turno, disciplina_id, professor_id
      `,
      [codigo, vagas, dia, turno, disciplinaId, professorId],
    );

    return result.rows[0];
  },

  async update(turmaId, { codigo, vagas, dia, turno, disciplinaId, professorId }, { client } = {}) {
    const db = executor(client);
    const result = await db.query(
      `
        UPDATE turma
        SET codigo = COALESCE($1, codigo),
            vagas = COALESCE($2, vagas),
            dia = COALESCE($3, dia),
            turno = COALESCE($4, turno),
            disciplina_id = COALESCE($5, disciplina_id),
            professor_id = COALESCE($6, professor_id)
        WHERE id = $7
        RETURNING id, codigo, vagas, dia, turno, disciplina_id, professor_id
      `,
      [codigo, vagas, dia, turno, disciplinaId, professorId, turmaId],
    );

    return result.rows[0] ?? null;
  },

  async delete(turmaId, { client } = {}) {
    const db = executor(client);
    const result = await db.query(
      `
        DELETE FROM turma
        WHERE id = $1
        RETURNING id
      `,
      [turmaId],
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
        ${TURMA_BASE_QUERY}
        WHERE codigo = $1
      `,
      [codigo],
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
