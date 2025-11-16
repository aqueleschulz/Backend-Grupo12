import pool from '../db/pool.js';

const executor = (client) => client ?? pool;

// Buscar o usuário pelo email
async function findByEmail(email, { client } = {}) {
  if (!email) {
    return null;
  }

  const db = executor(client);
  const result = await db.query(
    `
      SELECT 
        u.id, 
        u.email, 
        u.senha_hash, 
        u.nome,
        ARRAY_AGG(r.nome) as roles
      FROM usuario u
      LEFT JOIN usuariorole ur ON ur.usuario_id = u.id
      LEFT JOIN role r ON r.id = ur.role_id
      WHERE u.email = $1
      GROUP BY u.id
    `,
    [email],
  );

  return result.rows[0] ?? null;
}

async function findAll() {
  const query = `
    SELECT id, nome, email, roles
    FROM usuario
    ORDER BY nome ASC
  `;
  const result = await db.query(query);
  return result.rows;
}

async function findByRole(role) {
  const query = `
    SELECT id, nome, email, roles
    FROM usuario
    WHERE $1 = ANY(roles)
    ORDER BY nome ASC
  `;
  const result = await db.query(query, [role]);
  return result.rows;
}

export const UsuarioRepository = {
  findByEmail,
  findAll,
  findByRole
};
