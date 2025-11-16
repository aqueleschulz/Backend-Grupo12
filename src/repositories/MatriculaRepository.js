import pool from "../db/pool.js";

export default {
  async findMatriculaDoAluno(matriculaId, alunoId) {
    const sql = `
      SELECT * FROM matricula 
      WHERE id = $1 AND aluno_id = $2
    `;
    const result = await pool.query(sql, [matriculaId, alunoId]);
    return result.rows[0];
  },

  async existsMatriculaAtivaDoAlunoNaTurma(alunoId, turmaId, { client = pool } = {}) {
    const sql = `
      SELECT 1 FROM matricula
      WHERE aluno_id = $1 AND turma_id = $2 AND status = 'ATIVA'
      LIMIT 1
    `;
    const result = await client.query(sql, [alunoId, turmaId]);
    return result.rowCount > 0;
  },

  async countMatriculasAtivasNaTurma(turmaId, { client = pool } = {}) {
    const sql = `
      SELECT COUNT(*) FROM matricula
      WHERE turma_id = $1 AND status = 'ATIVA'
    `;
    const result = await client.query(sql, [turmaId]);
    return result.rows[0].count;
  },

  async listHorariosCodigoAtivosDoAluno(alunoId, { client = pool } = {}) {
    const sql = `
      SELECT t.dia || '-' || t.turno AS horario_codigo
      FROM matricula m
      JOIN turma t ON t.id = m.turma_id
      WHERE m.aluno_id = $1 AND m.status = 'ATIVA'
    `;
    const result = await client.query(sql, [alunoId]);
    return result.rows.map(r => r.horario_codigo);
  },

  async insertMatricula({ alunoId, turmaId }, { client = pool } = {}) {
    const sql = `
      INSERT INTO matricula (aluno_id, turma_id, status)
      VALUES ($1, $2, 'ATIVA')
      RETURNING *
    `;
    const result = await client.query(sql, [alunoId, turmaId]);
    return result.rows[0];
  },

  async cancelarMatricula(id) {
    await pool.query(
      "UPDATE matricula SET status = 'CANCELADA' WHERE id = $1",
      [id]
    );
  },

  async listMatriculasDoAluno(alunoId) {
    const sql = `
      SELECT m.*, 
             t.codigo AS turma_codigo,
             d.nome AS disciplina_nome,
             u.nome AS professor_nome,
             (t.dia || '-' || t.turno) AS horario_codigo
      FROM matricula m
      JOIN turma t ON t.id = m.turma_id
      JOIN disciplina d ON d.id = t.disciplina_id
      JOIN usuario u ON u.id = t.professor_id
      WHERE m.aluno_id = $1
      ORDER BY m.data DESC
    `;
    const result = await pool.query(sql, [alunoId]);
    return result.rows;
  },

  // 🔥 ESTA FUNÇÃO ERA A QUE FALTAVA
  async listAll() {
    const sql = `
      SELECT m.*, 
        t.codigo AS turma_codigo,
        d.nome AS disciplina_nome,
        u.nome AS professor_nome,
        (t.dia || '-' || t.turno) AS horario_codigo
      FROM matricula m
      JOIN turma t ON t.id = m.turma_id
      JOIN disciplina d ON d.id = t.disciplina_id
      JOIN usuario u ON u.id = t.professor_id
      ORDER BY m.data DESC
    `;
    const result = await pool.query(sql);
    return result.rows;
  }
};
