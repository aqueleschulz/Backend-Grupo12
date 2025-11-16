import { jest } from '@jest/globals';

const mockTurmaRepository = {
  findById: jest.fn(),
  getHorarioCodigo: jest.fn(),
};

const mockMatriculaRepository = {
  existsMatriculaAtivaDoAlunoNaTurma: jest.fn(),
  countMatriculasAtivasNaTurma: jest.fn(),
  listHorariosCodigoAtivosDoAluno: jest.fn(),
  insertMatricula: jest.fn(),
  findMatriculaDoAluno: jest.fn(),
  cancelarMatricula: jest.fn(),
  listMatriculasDoAluno: jest.fn(),
};

const mockWithTransaction = jest.fn();

const mockClient = {
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  release: jest.fn(),
};

await jest.unstable_mockModule('../../src/repositories/TurmaRepository.js', () => ({
  default: mockTurmaRepository,
  __esModule: true,
}));

await jest.unstable_mockModule('../../src/repositories/MatriculaRepository.js', () => ({
  default: mockMatriculaRepository,
  __esModule: true,
}));

await jest.unstable_mockModule('../../src/db/pool.js', () => ({
  withTransaction: mockWithTransaction,
  default: {},
  __esModule: true,
}));

const { default: MatriculaService } = await import('../../src/services/MatriculaService.js');

const alunoId = 'aluno-1';
const turmaId = 'turma-1';

const resetMocks = () => {
  jest.clearAllMocks();
  mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
  
  mockWithTransaction.mockImplementation((fn) => fn(mockClient));
  mockTurmaRepository.getHorarioCodigo.mockReturnValue('21');
  mockMatriculaRepository.listHorariosCodigoAtivosDoAluno.mockResolvedValue([]);
  mockMatriculaRepository.existsMatriculaAtivaDoAlunoNaTurma.mockResolvedValue(false);
  mockMatriculaRepository.countMatriculasAtivasNaTurma.mockResolvedValue(0);
  mockMatriculaRepository.insertMatricula.mockResolvedValue({
    id: 'matricula-1',
    aluno_id: alunoId,
    turma_id: turmaId,
    status: 'ATIVA',
    data: '2024-01-01T00:00:00.000Z',
  });
  mockTurmaRepository.findById.mockResolvedValue({
    id: turmaId,
    vagas: 1,
    dia: 2,
    turno: 1,
  });
};

beforeEach(() => {
  resetMocks();
});

describe('MatriculaService.enroll', () => {
  it('lança erro quando turma não existe', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce(null);

    await expect(MatriculaService.enroll({ alunoId, turmaId })).rejects.toMatchObject({
      code: 'TURMA_INEXISTENTE',
    });
  });

  it('lança erro quando aluno já matriculado', async () => {
    mockMatriculaRepository.existsMatriculaAtivaDoAlunoNaTurma.mockResolvedValueOnce(true);

    await expect(MatriculaService.enroll({ alunoId, turmaId })).rejects.toMatchObject({
      code: 'JA_MATRICULADO_NA_TURMA',
    });
  });

  it('lança erro quando não há vagas', async () => {
    mockMatriculaRepository.countMatriculasAtivasNaTurma.mockResolvedValueOnce(1);

    await expect(MatriculaService.enroll({ alunoId, turmaId })).rejects.toMatchObject({
      code: 'SEM_VAGAS',
    });
  });

  it('lança erro quando há choque de horário', async () => {
    mockMatriculaRepository.listHorariosCodigoAtivosDoAluno.mockResolvedValueOnce(['21']);

    await expect(MatriculaService.enroll({ alunoId, turmaId })).rejects.toMatchObject({
      code: 'CHOQUE_HORARIO',
    });
  });

  it('cria matrícula com sucesso', async () => {
    const resultado = await MatriculaService.enroll({ alunoId, turmaId });

    expect(resultado).toEqual({
      id: 'matricula-1',
      alunoId,
      turmaId,
      horarioCodigo: '21',
      status: 'ATIVA',
      criadoEm: '2024-01-01T00:00:00.000Z',
    });
    expect(mockMatriculaRepository.insertMatricula).toHaveBeenCalledWith({ alunoId, turmaId }, { client: mockClient });
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('pg_advisory_xact_lock'),
      [turmaId]
    );
  });
});

describe('MatriculaService.cancel', () => {
  it('lança erro quando matrícula não pertence ao aluno', async () => {
    mockMatriculaRepository.findMatriculaDoAluno.mockResolvedValueOnce(null);

    await expect(MatriculaService.cancel({ alunoId, matriculaId: 'mat-1' })).rejects.toMatchObject({
      code: 'MATRICULA_NAO_ENCONTRADA',
    });
  });

  it('cancela matrícula com sucesso', async () => {
    mockMatriculaRepository.findMatriculaDoAluno.mockResolvedValueOnce({
      id: 'mat-1',
      aluno_id: alunoId,
    });

    await MatriculaService.cancel({ alunoId, matriculaId: 'mat-1' });

    expect(mockMatriculaRepository.cancelarMatricula).toHaveBeenCalledWith('mat-1');
  });
});

describe('MatriculaService.listByAluno', () => {
  it('retorna lista formatada', async () => {
    mockMatriculaRepository.listMatriculasDoAluno.mockResolvedValueOnce([
      {
        id: 'mat-1',
        aluno_id: alunoId,
        turma_id: turmaId,
        status: null,
        turma_codigo: 'TURMA1',
        disciplina_nome: 'Algoritmos',
        professor_nome: 'Ada Lovelace',
        horario_codigo: '21',
        data: '2024-01-01T00:00:00.000Z',
      },
    ]);

    const lista = await MatriculaService.listByAluno(alunoId);

    expect(lista).toEqual([
      {
        id: 'mat-1',
        alunoId,
        turmaId,
        status: 'ATIVA',
        turmaCodigo: 'TURMA1',
        disciplinaNome: 'Algoritmos',
        professorNome: 'Ada Lovelace',
        horarioCodigo: '21',
        criadoEm: '2024-01-01T00:00:00.000Z',
      },
    ]);
  });
}); 