import pool from "../db/pool.js";

const DisciplinaRepository = {
  async findAll() {
    const res = await pool.query("SELECT id, nome, codigo FROM disciplina ORDER BY nome");
    return res.rows;
  },

  async findById(id) {
    const res = await pool.query("SELECT id, nome, codigo FROM disciplina WHERE id = $1", [id]);
    return res.rows[0] ?? null;
  },

  async create({ nome, codigo }) {
    const res = await pool.query(
      `INSERT INTO disciplina (id, nome, codigo)
       VALUES (uuid_generate_v4(), $1, $2) RETURNING id, nome, codigo`,
      [nome, codigo]
    );
    return res.rows[0];
  },

  async update(id, { nome, codigo }) {
    const res = await pool.query(
      `UPDATE disciplina SET nome = $1, codigo = $2 WHERE id = $3 RETURNING id, nome, codigo`,
      [nome, codigo, id]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM disciplina WHERE id = $1", [id]);
  },
};

export default DisciplinaRepository;
