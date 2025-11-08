// src/db/pool.js
import pkg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pkg;

const poolConfig = env.db.connectionString
  ? { connectionString: env.db.connectionString, ssl: env.db.ssl }
  : {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    ssl: env.db.ssl,
  };

const pool = new Pool(poolConfig);

/**
 * withTransaction(fn, { isolationLevel, retries })
 * - isolationLevel: 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE'
 * - retries: nº de tentativas em caso de 40001 (serialization_failure)
 */
export const withTransaction = async (
  callback,
  { isolationLevel = 'READ COMMITTED', retries = 0 } = {}
) => {
  let attempt = 0;

  // loop de retry apenas para 40001
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const client = await pool.connect();
    let shouldRetry = false;

    try {
      await client.query('BEGIN');
      if (isolationLevel) {
        await client.query(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
      }

      await client.query(`SET LOCAL lock_timeout = '5s'`);
      await client.query(`SET LOCAL statement_timeout = '15s'`);

      const result = await callback(client);

      await client.query('COMMIT');
      return result;
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch { /* noop */ }

      // retry somente em SERIALIZATION FAILURE
      if (err && err.code === '40001' && attempt < retries) {
        attempt += 1;
        shouldRetry = true;
      } else {
        throw err;
      }
    } finally {
      client.release();
    }

    if (shouldRetry) continue;
  }
};

export default pool;
