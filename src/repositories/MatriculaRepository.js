import pool from "../db/pool.js";

const MatriculaRepository = {
  async existsMatriculaAtivaDoAlunoNaTurma(alunoId, turmaId, { client = pool } = {}) {
    const sql = `SELECT 1 FROM matricula WHERE aluno_id=$1 AND turma_id=$2 AND status='ATIVA' LIMIT 1`;
    const r = await client.query(sql, [alunoId, turmaId]);
    return r.rowCount > 0;
  },

  async countMatriculasAtivasNaTurma(turmaId, { client = pool } = {}) {
    const r = await client.query(`SELECT COUNT(*) FROM matricula WHERE turma_id=$1 AND status='ATIVA'`, [turmaId]);
    return Number(r.rows[0].count);
  },

  async listHorariosCodigoAtivosDoAluno(alunoId, { client = pool } = {}) {
    const sql = `SELECT t.dia || '-' || t.turno AS horario FROM matricula m JOIN turma t ON t.id = m.turma_id WHERE m.aluno_id = $1 AND m.status='ATIVA'`;
    const r = await client.query(sql, [alunoId]);
    return r.rows.map(x => x.horario);
  },

  async insertMatricula({ alunoId, turmaId }, { client = pool } = {}) {
    const sql = `INSERT INTO matricula (id, aluno_id, turma_id, status) VALUES (uuid_generate_v4(), $1, $2, 'ATIVA') RETURNING *`;
    const r = await client.query(sql, [alunoId, turmaId]);
    return r.rows[0];
  },

  async findMatriculaDoAluno(matriculaId, alunoId) {
    const r = await pool.query(`SELECT * FROM matricula WHERE id=$1 AND aluno_id=$2`, [matriculaId, alunoId]);
    return r.rows[0] ?? null;
  },

  async cancelarMatricula(id) {
    await pool.query(`UPDATE matricula SET status='CANCELADA' WHERE id=$1`, [id]);
  },

  async listMatriculasDoAluno(alunoId) {
    const sql = `
      SELECT m.*, t.codigo AS turma_codigo, d.nome AS disciplina_nome, u.nome AS professor_nome, (t.dia || '-' || t.turno) AS horario_codigo
      FROM matricula m
      JOIN turma t ON t.id = m.turma_id
      JOIN disciplina d ON d.id = t.disciplina_id
      JOIN usuario u ON u.id = t.professor_id
      WHERE m.aluno_id = $1
      ORDER BY m.data DESC
    `;
    const r = await pool.query(sql, [alunoId]);
    return r.rows;
  },

  async listAll() {
    const sql = `
      SELECT m.*, t.codigo AS turma_codigo, d.nome AS disciplina_nome, u.nome AS professor_nome, (t.dia || '-' || t.turno) AS horario_codigo
      FROM matricula m
      JOIN turma t ON t.id = m.turma_id
      JOIN disciplina d ON d.id = t.disciplina_id
      JOIN usuario u ON u.id = t.professor_id
      ORDER BY m.data DESC
    `;
    const r = await pool.query(sql);
    return r.rows;
  }
};

export default MatriculaRepository;
