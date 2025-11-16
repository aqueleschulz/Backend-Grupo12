import pool from "../db/pool.js";

const TurmaRepository = {
  async findAll() {
    const res = await pool.query(
      `
      SELECT t.*, d.nome AS disciplina_nome, u.nome AS professor_nome
      FROM turma t
      LEFT JOIN disciplina d ON d.id = t.disciplina_id
      LEFT JOIN usuario u ON u.id = t.professor_id
      ORDER BY t.codigo
      `
    );
    return res.rows;
  },

  async findById(id, opts = {}) {
    const client = opts.client ?? pool;

    const res = await client.query(
      `
      SELECT t.*, d.nome AS disciplina_nome, u.nome AS professor_nome
      FROM turma t
      LEFT JOIN disciplina d ON d.id = t.disciplina_id
      LEFT JOIN usuario u ON u.id = t.professor_id
      WHERE t.id = $1
      `,
      [id]
    );

    return res.rows[0] ?? null;
  },

  async create({ codigo, vagas, dia, turno, disciplinaId, professorId }) {

    const vagasInt =
      vagas === "" || vagas === undefined || vagas === null
        ? null
        : Number(vagas);

    const res = await pool.query(
      `
      INSERT INTO turma (id, codigo, vagas, dia, turno, disciplina_id, professor_id)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        codigo,
        vagasInt,   // 🔥 AQUI ESTÁ A CORREÇÃO DEFINITIVA
        dia,
        turno,
        disciplinaId,
        professorId
      ]
    );

    return res.rows[0];
  },

  async update(id, data) {

    const vagasInt =
      data.vagas === "" || data.vagas === undefined || data.vagas === null
        ? null
        : Number(data.vagas);

    const res = await pool.query(
      `
      UPDATE turma
      SET codigo = $1, vagas = $2, dia = $3, turno = $4,
          disciplina_id = $5, professor_id = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        data.codigo,
        vagasInt,   // 🔥 MESMA CORREÇÃO PARA UPDATE
        data.dia,
        data.turno,
        data.disciplinaId,
        data.professorId,
        id
      ]
    );

    return res.rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM turma WHERE id=$1", [id]);
  },
};

export default TurmaRepository;
