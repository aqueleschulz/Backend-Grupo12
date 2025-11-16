import pool from "../db/pool.js";

const UsuarioRepository = {
  async findAll() {
    const sql = `
      SELECT u.id, u.nome, u.email,
        COALESCE(ARRAY_AGG(r.nome) FILTER (WHERE r.nome IS NOT NULL), '{}') AS roles
      FROM usuario u
      LEFT JOIN usuariorole ur ON ur.usuario_id = u.id
      LEFT JOIN role r ON r.id = ur.role_id
      GROUP BY u.id
      ORDER BY u.nome
    `;
    const result = await pool.query(sql);
    return result.rows;
  },

  async findByEmail(email) {
    const sql = `
      SELECT u.*, 
        COALESCE(ARRAY_AGG(r.nome) FILTER (WHERE r.nome IS NOT NULL), '{}') AS roles
      FROM usuario u
      LEFT JOIN usuariorole ur ON ur.usuario_id = u.id
      LEFT JOIN role r ON r.id = ur.role_id
      WHERE u.email = $1
      GROUP BY u.id
      LIMIT 1
    `;
    const result = await pool.query(sql, [email]);
    return result.rows[0] ?? null;
  },

  async findById(id) {
    const sql = `
      SELECT u.id, u.nome, u.email,
        COALESCE(ARRAY_AGG(r.nome) FILTER (WHERE r.nome IS NOT NULL), '{}') AS roles
      FROM usuario u
      LEFT JOIN usuariorole ur ON ur.usuario_id = u.id
      LEFT JOIN role r ON r.id = ur.role_id
      WHERE u.id = $1
      GROUP BY u.id
      LIMIT 1
    `;
    const result = await pool.query(sql, [id]);
    return result.rows[0] ?? null;
  },

  async create({ nome, email, senha_hash, roles }) {
    const userSql = `
      INSERT INTO usuario (id, nome, email, senha_hash)
      VALUES (uuid_generate_v4(), $1, $2, $3)
      RETURNING id, nome, email
    `;
    const result = await pool.query(userSql, [nome, email, senha_hash]);
    const usuario = result.rows[0];

    if (roles?.length) {
      for (const roleName of roles) {
        await pool.query(
          `INSERT INTO usuariorole (usuario_id, role_id)
           SELECT $1, id FROM role WHERE nome = $2
           ON CONFLICT DO NOTHING;`,
          [usuario.id, roleName]
        );
      }
    }

    return { id: usuario.id, nome: usuario.nome, email: usuario.email, roles };
  },

  async update(id, { nome, email, roles }) {
    await pool.query(
      `UPDATE usuario SET nome = $1, email = $2 WHERE id = $3`,
      [nome, email, id]
    );

    if (roles) {
      await pool.query(`DELETE FROM usuariorole WHERE usuario_id = $1`, [id]);

      for (const roleName of roles) {
        await pool.query(
          `INSERT INTO usuariorole (usuario_id, role_id)
           SELECT $1, id FROM role WHERE nome = $2
           ON CONFLICT DO NOTHING;`,
          [id, roleName]
        );
      }
    }

    return this.findById(id);
  },

  async delete(id) {
    await pool.query("DELETE FROM usuariorole WHERE usuario_id = $1", [id]);
    await pool.query("DELETE FROM usuario WHERE id = $1", [id]);
  },
};

export default UsuarioRepository;
