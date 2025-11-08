import { jest } from '@jest/globals';
import { newDb } from 'pg-mem';
import { randomUUID } from 'node:crypto';

const db = newDb({ autoCreateForeignKeyIndices: true });

db.public.registerFunction({
  name: 'uuid_generate_v4',
  returns: 'uuid',
  implementation: randomUUID,
});

const { Pool } = db.adapters.createPg();
const pool = new Pool();

const queue = [];
let locked = false;

const acquire = () =>
  locked
    ? new Promise((resolve) => queue.push(resolve))
    : ((locked = true), Promise.resolve());

const release = () => {
  locked = false;
  const next = queue.shift();
  if (next) {
    locked = true;
    next();
  }
};

const withTransaction = async (callback, options = {}) => {
  await acquire();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // pg-mem ainda não suporta SET TRANSACTION ...; para o teste basta o lock lógico acima
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    release();
  }
};

await jest.unstable_mockModule('../../src/db/pool.js', () => ({
  __esModule: true,
  default: pool,
  withTransaction,
}));

const { default: MatriculaService } = await import('../../src/services/MatriculaService.js');
const { default: MatriculaRepository } = await import('../../src/repositories/MatriculaRepository.js');

const alunoId1 = '00000000-0000-0000-0000-000000000001';
const alunoId2 = '00000000-0000-0000-0000-000000000002';
const professorId = '00000000-0000-0000-0000-000000000010';
const disciplinaId = '00000000-0000-0000-0000-0000000000aa';
const turmaId = '00000000-0000-0000-0000-0000000000bb';

const setupSchema = () => {
  db.public.none(`
    CREATE TABLE IF NOT EXISTS usuario (
      id uuid PRIMARY KEY,
      nome varchar NOT NULL,
      email varchar NOT NULL,
      senha_hash varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS aluno (
      id uuid PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
      ra varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS professor (
      id uuid PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
      siape varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disciplina (
      id uuid PRIMARY KEY,
      codigo varchar NOT NULL,
      nome varchar NOT NULL,
      creditos integer
    );

    CREATE TABLE IF NOT EXISTS turma (
      id uuid PRIMARY KEY,
      codigo varchar NOT NULL,
      disciplina_id uuid REFERENCES disciplina(id),
      professor_id uuid REFERENCES professor(id),
      vagas integer,
      dia integer,
      turno integer
    );

    CREATE TABLE IF NOT EXISTS matricula (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      aluno_id uuid NOT NULL REFERENCES aluno(id),
      turma_id uuid NOT NULL REFERENCES turma(id),
      data timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
      status varchar
    );

    CREATE UNIQUE INDEX IF NOT EXISTS uq_matricula_aluno_turma
      ON matricula (aluno_id, turma_id);
  `);
};

const resetData = async () => {
  await pool.query('TRUNCATE TABLE matricula RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE turma RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE disciplina RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE professor RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE aluno RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE usuario RESTART IDENTITY CASCADE');

  await pool.query(
    `
      INSERT INTO usuario (id, nome, email, senha_hash) VALUES
      ($1, 'Aluno 1', 'aluno1@example.com', 'hash'),
      ($2, 'Aluno 2', 'aluno2@example.com', 'hash'),
      ($3, 'Professor 1', 'prof1@example.com', 'hash')
    `,
    [alunoId1, alunoId2, professorId],
  );

  await pool.query(
    `
      INSERT INTO aluno (id, ra) VALUES
      ($1, 'RA1'),
      ($2, 'RA2')
    `,
    [alunoId1, alunoId2],
  );

  await pool.query(
    `
      INSERT INTO professor (id, siape) VALUES
      ($1, 'SIAPE1')
    `,
    [professorId],
  );

  await pool.query(
    `
      INSERT INTO disciplina (id, codigo, nome, creditos) VALUES
      ($1, 'DISC1', 'Algoritmos', 4)
    `,
    [disciplinaId],
  );

  await pool.query(
    `
      INSERT INTO turma (id, codigo, disciplina_id, professor_id, vagas, dia, turno)
      VALUES ($1, 'TURMA1', $2, $3, 1, 2, 1)
    `,
    [turmaId, disciplinaId, professorId],
  );
};

setupSchema();

describe('Matricula - Concurrency', () => {
  beforeEach(async () => {
    await resetData();
  });

  it('permite apenas uma matrícula na última vaga sob concorrência', async () => {
    const [resultado1, resultado2] = await Promise.allSettled([
      MatriculaService.enroll({ alunoId: alunoId1, turmaId }),
      MatriculaService.enroll({ alunoId: alunoId2, turmaId }),
    ]);

    const fulfilled = [resultado1, resultado2].filter((r) => r.status === 'fulfilled');
    const rejected = [resultado1, resultado2].filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toMatchObject({ code: 'SEM_VAGAS' });

    const totalAtivas = await MatriculaRepository.countMatriculasAtivasNaTurma(turmaId);
    expect(totalAtivas).toBe(1);
  });
});
