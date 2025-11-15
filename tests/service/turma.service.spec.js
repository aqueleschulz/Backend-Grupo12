import { jest } from '@jest/globals';

const mockTurmaRepository = {
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByCodigo: jest.fn(),
};

const mockDisciplinaRepository = {
  findById: jest.fn(),
};

const mockProfessorRepository = {
  findById: jest.fn(),
};

const mockMatriculaRepository = {
  countMatriculasAtivasNaTurma: jest.fn(),
};

await jest.unstable_mockModule('../../src/repositories/TurmaRepository.js', () => ({
  default: mockTurmaRepository,
  __esModule: true,
}));

await jest.unstable_mockModule('../../src/repositories/DisciplinaRepository.js', () => ({
  default: mockDisciplinaRepository,
  __esModule: true,
}));

await jest.unstable_mockModule('../../src/repositories/ProfessorRepository.js', () => ({
  default: mockProfessorRepository,
  __esModule: true,
}));

await jest.unstable_mockModule('../../src/repositories/MatriculaRepository.js', () => ({
  default: mockMatriculaRepository,
  __esModule: true,
}));

const { default: TurmaService } = await import('../../src/services/TurmaService.js');

const turmaId = 'turma-1';
const disciplinaId = 'disc-1';
const professorId = 'prof-1';
const adminId = 'admin-1';

const resetMocks = () => {
  jest.clearAllMocks();
  mockMatriculaRepository.countMatriculasAtivasNaTurma.mockResolvedValue(0);
  mockTurmaRepository.findByCodigo.mockResolvedValue(null);
};

beforeEach(() => {
  resetMocks();
});

describe('TurmaService.criar', () => {
  const turmaData = {
    codigo: 'TURMA001',
    vagas: 30,
    dia: 2,
    turno: 1,
    disciplinaId,
    professorId,
    usuarioId: { id: professorId, roles: ['PROFESSOR'] },
  };

  it('lança erro quando campos obrigatórios estão faltando', async () => {
    await expect(
      TurmaService.criar({
        codigo: 'TURMA001',
        disciplinaId,
        professorId,
        usuarioId: { id: professorId, roles: ['PROFESSOR'] },
      })
    ).rejects.toMatchObject({
      code: 'PARAMETRO_INVALIDO',
    });
  });

  it('lança erro quando dia está fora do range válido', async () => {
    await expect(
      TurmaService.criar({
        ...turmaData,
        dia: 0,
      })
    ).rejects.toMatchObject({
      code: 'PARAMETRO_INVALIDO',
    });
  });

  it('lança erro quando turno está fora do range válido', async () => {
    await expect(
      TurmaService.criar({
        ...turmaData,
        turno: 4,
      })
    ).rejects.toMatchObject({
      code: 'PARAMETRO_INVALIDO',
    });
  });

  it('lança erro quando disciplina não existe', async () => {
    mockDisciplinaRepository.findById.mockResolvedValueOnce(null);

    await expect(TurmaService.criar(turmaData)).rejects.toMatchObject({
      code: 'DISCIPLINA_INEXISTENTE',
    });
  });

  it('lança erro quando professor não existe', async () => {
    mockDisciplinaRepository.findById.mockResolvedValueOnce({ id: disciplinaId });
    mockProfessorRepository.findById.mockResolvedValueOnce(null);

    await expect(TurmaService.criar(turmaData)).rejects.toMatchObject({
      code: 'PROFESSOR_INEXISTENTE',
    });
  });

  it('lança erro quando código já existe', async () => {
    mockDisciplinaRepository.findById.mockResolvedValueOnce({ id: disciplinaId });
    mockProfessorRepository.findById.mockResolvedValueOnce({ id: professorId });
    mockTurmaRepository.findByCodigo.mockResolvedValueOnce({ id: 'outra-turma' });

    await expect(TurmaService.criar(turmaData)).rejects.toMatchObject({
      code: 'TURMA_CODIGO_DUPLICADO',
    });
  });

  it('lança erro quando professor tenta criar turma para outro professor', async () => {
    mockDisciplinaRepository.findById.mockResolvedValueOnce({ id: disciplinaId });
    mockProfessorRepository.findById.mockResolvedValueOnce({ id: 'outro-prof' });
    mockTurmaRepository.findByCodigo.mockResolvedValueOnce(null);

    const dataComOutroProfessor = {
      ...turmaData,
      professorId: 'outro-prof',
    };

    await expect(TurmaService.criar(dataComOutroProfessor)).rejects.toMatchObject({
      code: 'ROLE_FORBIDDEN',
    });
  });

  it('permite admin criar turma para qualquer professor', async () => {
    mockDisciplinaRepository.findById.mockResolvedValueOnce({ id: disciplinaId });
    mockProfessorRepository.findById.mockResolvedValueOnce({ id: professorId });
    mockTurmaRepository.findByCodigo.mockResolvedValueOnce(null);
    mockTurmaRepository.create.mockResolvedValueOnce({
      id: turmaId,
      codigo: 'TURMA001',
      vagas: 30,
      dia: 2,
      turno: 1,
      disciplina_id: disciplinaId,
      professor_id: professorId,
    });
    mockTurmaRepository.findAll.mockResolvedValueOnce([
      {
        id: turmaId,
        codigo: 'TURMA001',
        vagas: 30,
        dia: 2,
        turno: 1,
        disciplina_id: disciplinaId,
        disciplina_codigo: 'DISC1',
        disciplina_nome: 'Algoritmos',
        disciplina_creditos: 4,
        professor_id: professorId,
        professor_nome: 'Prof. Silva',
        professor_siape: 'SIAPE1',
        matriculados: 0,
      },
    ]);

    const dataComAdmin = {
      ...turmaData,
      usuarioId: { id: adminId, roles: ['ADMIN'] },
    };

    const resultado = await TurmaService.criar(dataComAdmin);

    expect(resultado).toMatchObject({
      id: turmaId,
      codigo: 'TURMA001',
      vagas: 30,
      vagasDisponiveis: 30,
      matriculados: 0,
    });
    expect(resultado.horario.codigo).toBe('21');
    expect(resultado.horario.descricao).toBe('Segunda-feira - Manhã');
    expect(mockTurmaRepository.create).toHaveBeenCalled();
  });

  it('cria turma com sucesso', async () => {
    mockDisciplinaRepository.findById.mockResolvedValueOnce({ id: disciplinaId });
    mockProfessorRepository.findById.mockResolvedValueOnce({ id: professorId });
    mockTurmaRepository.findByCodigo.mockResolvedValueOnce(null);
    mockTurmaRepository.create.mockResolvedValueOnce({
      id: turmaId,
      codigo: 'TURMA001',
      vagas: 30,
      dia: 2,
      turno: 1,
      disciplina_id: disciplinaId,
      professor_id: professorId,
    });
    mockTurmaRepository.findAll.mockResolvedValueOnce([
      {
        id: turmaId,
        codigo: 'TURMA001',
        vagas: 30,
        dia: 2,
        turno: 1,
        disciplina_id: disciplinaId,
        disciplina_codigo: 'DISC1',
        disciplina_nome: 'Algoritmos',
        disciplina_creditos: 4,
        professor_id: professorId,
        professor_nome: 'Prof. Silva',
        professor_siape: 'SIAPE1',
        matriculados: 0,
      },
    ]);

    const resultado = await TurmaService.criar(turmaData);

    expect(resultado).toMatchObject({
      id: turmaId,
      codigo: 'TURMA001',
      vagas: 30,
      vagasDisponiveis: 30,
      matriculados: 0,
    });
    expect(resultado.horario.dia).toBe(2);
    expect(resultado.horario.turno).toBe(1);
    expect(resultado.horario.codigo).toBe('21');
    expect(resultado.horario.descricao).toBe('Segunda-feira - Manhã');
    expect(resultado.disciplina).toMatchObject({
      id: disciplinaId,
      codigo: 'DISC1',
      nome: 'Algoritmos',
      creditos: 4,
    });
    expect(resultado.professor).toMatchObject({
      id: professorId,
      nome: 'Prof. Silva',
      siape: 'SIAPE1',
    });
    expect(mockTurmaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        codigo: 'TURMA001',
        vagas: 30,
        dia: 2,
        turno: 1,
        disciplinaId,
        professorId,
      })
    );
  });
});

describe('TurmaService.listar', () => {
  it('retorna lista vazia quando não há turmas', async () => {
    mockTurmaRepository.findAll.mockResolvedValueOnce([]);

    const lista = await TurmaService.listar();

    expect(lista).toEqual([]);
  });

  it('retorna lista formatada com múltiplas turmas', async () => {
    mockTurmaRepository.findAll.mockResolvedValueOnce([
      {
        id: 'turma-1',
        codigo: 'TURMA001',
        vagas: 30,
        dia: 2,
        turno: 1,
        disciplina_id: disciplinaId,
        disciplina_codigo: 'DISC1',
        disciplina_nome: 'Algoritmos',
        disciplina_creditos: 4,
        professor_id: professorId,
        professor_nome: 'Prof. Silva',
        professor_siape: 'SIAPE1',
        matriculados: 5,
      },
      {
        id: 'turma-2',
        codigo: 'TURMA002',
        vagas: 20,
        dia: 3,
        turno: 2,
        disciplina_id: disciplinaId,
        disciplina_codigo: 'DISC1',
        disciplina_nome: 'Algoritmos',
        disciplina_creditos: 4,
        professor_id: professorId,
        professor_nome: 'Prof. Silva',
        professor_siape: 'SIAPE1',
        matriculados: 0,
      },
    ]);

    const lista = await TurmaService.listar();

    expect(lista).toHaveLength(2);
    expect(lista[0]).toMatchObject({
      codigo: 'TURMA001',
      vagas: 30,
      vagasDisponiveis: 25,
      matriculados: 5,
    });
    expect(lista[0].horario.codigo).toBe('21');
    expect(lista[1]).toMatchObject({
      codigo: 'TURMA002',
      vagas: 20,
      vagasDisponiveis: 20,
      matriculados: 0,
    });
    expect(lista[1].horario.codigo).toBe('32');
  });
});

describe('TurmaService.buscarPorId', () => {
  it('lança erro quando turma não existe', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce(null);

    await expect(TurmaService.buscarPorId(turmaId)).rejects.toMatchObject({
      code: 'TURMA_INEXISTENTE',
    });
  });

  it('retorna turma quando existe', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      codigo: 'TURMA001',
      vagas: 30,
      dia: 2,
      turno: 1,
    });
    mockTurmaRepository.findAll.mockResolvedValueOnce([
      {
        id: turmaId,
        codigo: 'TURMA001',
        vagas: 30,
        dia: 2,
        turno: 1,
        disciplina_id: disciplinaId,
        disciplina_codigo: 'DISC1',
        disciplina_nome: 'Algoritmos',
        disciplina_creditos: 4,
        professor_id: professorId,
        professor_nome: 'Prof. Silva',
        professor_siape: 'SIAPE1',
        matriculados: 0,
      },
    ]);

    const turma = await TurmaService.buscarPorId(turmaId);

    expect(turma).toMatchObject({
      id: turmaId,
      codigo: 'TURMA001',
      vagas: 30,
      vagasDisponiveis: 30,
    });
    expect(turma.horario.codigo).toBe('21');
  });
});

describe('TurmaService.atualizar', () => {
  it('lança erro quando turma não existe', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce(null);

    await expect(
      TurmaService.atualizar(turmaId, {
        vagas: 35,
        usuarioId: { id: professorId, roles: ['PROFESSOR'] },
      })
    ).rejects.toMatchObject({
      code: 'TURMA_INEXISTENTE',
    });
  });

  it('lança erro quando dia está fora do range', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: professorId,
    });

    await expect(
      TurmaService.atualizar(turmaId, {
        dia: 8,
        usuarioId: { id: professorId, roles: ['PROFESSOR'] },
      })
    ).rejects.toMatchObject({
      code: 'PARAMETRO_INVALIDO',
    });
  });

  it('lança erro quando turno está fora do range', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: professorId,
    });

    await expect(
      TurmaService.atualizar(turmaId, {
        turno: 0,
        usuarioId: { id: professorId, roles: ['PROFESSOR'] },
      })
    ).rejects.toMatchObject({
      code: 'PARAMETRO_INVALIDO',
    });
  });

  it('lança erro quando disciplina não existe', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: professorId,
    });
    mockDisciplinaRepository.findById.mockResolvedValueOnce(null);

    await expect(
      TurmaService.atualizar(turmaId, {
        disciplinaId: 'disc-inexistente',
        usuarioId: { id: professorId, roles: ['PROFESSOR'] },
      })
    ).rejects.toMatchObject({
      code: 'DISCIPLINA_INEXISTENTE',
    });
  });

  it('lança erro quando professor não existe', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: professorId,
    });
    mockProfessorRepository.findById.mockResolvedValueOnce(null);

    await expect(
      TurmaService.atualizar(turmaId, {
        professorId: 'prof-inexistente',
        usuarioId: { id: professorId, roles: ['PROFESSOR'] },
      })
    ).rejects.toMatchObject({
      code: 'PROFESSOR_INEXISTENTE',
    });
  });

  it('lança erro quando professor tenta atualizar turma de outro', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: 'outro-prof',
    });
    mockProfessorRepository.findById.mockResolvedValueOnce({
      id: 'outro-prof',
    });

    await expect(
      TurmaService.atualizar(turmaId, {
        professorId: 'outro-prof',
        vagas: 35,
        usuarioId: { id: professorId, roles: ['PROFESSOR'] },
      })
    ).rejects.toMatchObject({
      code: 'ROLE_FORBIDDEN',
    });
  });

  it('atualiza turma com sucesso (apenas vagas)', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: professorId,
    });
    mockTurmaRepository.update.mockResolvedValueOnce({
      id: turmaId,
      codigo: 'TURMA001',
      vagas: 35,
      dia: 2,
      turno: 1,
      disciplina_id: disciplinaId,
      professor_id: professorId,
    });
    mockTurmaRepository.findAll.mockResolvedValueOnce([
      {
        id: turmaId,
        codigo: 'TURMA001',
        vagas: 35,
        dia: 2,
        turno: 1,
        disciplina_id: disciplinaId,
        disciplina_codigo: 'DISC1',
        disciplina_nome: 'Algoritmos',
        disciplina_creditos: 4,
        professor_id: professorId,
        professor_nome: 'Prof. Silva',
        professor_siape: 'SIAPE1',
        matriculados: 0,
      },
    ]);

    const resultado = await TurmaService.atualizar(turmaId, {
      vagas: 35,
      usuarioId: { id: professorId, roles: ['PROFESSOR'] },
    });

    expect(resultado.vagas).toBe(35);
    expect(resultado.vagasDisponiveis).toBe(35);
    expect(mockTurmaRepository.update).toHaveBeenCalled();
  });

  it('atualiza horário com sucesso', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: professorId,
    });
    mockTurmaRepository.update.mockResolvedValueOnce({
      id: turmaId,
      codigo: 'TURMA001',
      vagas: 30,
      dia: 3,
      turno: 2,
      disciplina_id: disciplinaId,
      professor_id: professorId,
    });
    mockTurmaRepository.findAll.mockResolvedValueOnce([
      {
        id: turmaId,
        codigo: 'TURMA001',
        vagas: 30,
        dia: 3,
        turno: 2,
        disciplina_id: disciplinaId,
        disciplina_codigo: 'DISC1',
        disciplina_nome: 'Algoritmos',
        disciplina_creditos: 4,
        professor_id: professorId,
        professor_nome: 'Prof. Silva',
        professor_siape: 'SIAPE1',
        matriculados: 0,
      },
    ]);

    const resultado = await TurmaService.atualizar(turmaId, {
      dia: 3,
      turno: 2,
      usuarioId: { id: professorId, roles: ['PROFESSOR'] },
    });

    expect(resultado.horario.codigo).toBe('32');
    expect(resultado.horario.descricao).toBe('Terça-feira - Tarde');
  });

  it('permite admin atualizar qualquer turma', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: 'outro-prof',
    });
    mockTurmaRepository.update.mockResolvedValueOnce({
      id: turmaId,
      codigo: 'TURMA001',
      vagas: 40,
      dia: 2,
      turno: 1,
      disciplina_id: disciplinaId,
      professor_id: 'outro-prof',
    });
    mockTurmaRepository.findAll.mockResolvedValueOnce([
      {
        id: turmaId,
        codigo: 'TURMA001',
        vagas: 40,
        dia: 2,
        turno: 1,
        disciplina_id: disciplinaId,
        disciplina_codigo: 'DISC1',
        disciplina_nome: 'Algoritmos',
        disciplina_creditos: 4,
        professor_id: 'outro-prof',
        professor_nome: 'Outro Prof',
        professor_siape: 'SIAPE2',
        matriculados: 0,
      },
    ]);

    const resultado = await TurmaService.atualizar(turmaId, {
      vagas: 40,
      usuarioId: { id: adminId, roles: ['ADMIN'] },
    });

    expect(resultado.vagas).toBe(40);
  });
});

describe('TurmaService.excluir', () => {
  it('lança erro quando turma não existe', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce(null);

    await expect(
      TurmaService.excluir(turmaId, { id: professorId, roles: ['PROFESSOR'] })
    ).rejects.toMatchObject({
      code: 'TURMA_INEXISTENTE',
    });
  });

  it('lança erro quando professor tenta excluir turma de outro', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: 'outro-prof',
    });

    await expect(
      TurmaService.excluir(turmaId, { id: professorId, roles: ['PROFESSOR'] })
    ).rejects.toMatchObject({
      code: 'ROLE_FORBIDDEN',
    });
  });

  it('lança erro quando turma tem matrículas ativas', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: professorId,
    });
    mockMatriculaRepository.countMatriculasAtivasNaTurma.mockResolvedValueOnce(5);

    await expect(
      TurmaService.excluir(turmaId, { id: professorId, roles: ['PROFESSOR'] })
    ).rejects.toMatchObject({
      code: 'TURMA_COM_MATRICULAS',
    });
  });

  it('exclui turma com sucesso', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: professorId,
    });
    mockTurmaRepository.delete.mockResolvedValueOnce({ id: turmaId });

    await TurmaService.excluir(turmaId, { id: professorId, roles: ['PROFESSOR'] });

    expect(mockTurmaRepository.delete).toHaveBeenCalledWith(turmaId);
  });

  it('permite admin excluir qualquer turma', async () => {
    mockTurmaRepository.findById.mockResolvedValueOnce({
      id: turmaId,
      professor_id: 'outro-prof',
    });
    mockTurmaRepository.delete.mockResolvedValueOnce({ id: turmaId });

    await TurmaService.excluir(turmaId, { id: adminId, roles: ['ADMIN'] });

    expect(mockTurmaRepository.delete).toHaveBeenCalled();
  });
});

