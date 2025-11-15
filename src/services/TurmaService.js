import { createAppError } from '../errors/AppError.js';
import TurmaRepository from '../repositories/TurmaRepository.js';
import DisciplinaRepository from '../repositories/DisciplinaRepository.js';
import ProfessorRepository from '../repositories/ProfessorRepository.js';
import MatriculaRepository from '../repositories/MatriculaRepository.js';
import { Horario } from '../../domain/Horario.js';

class TurmaService {
  async criar({ codigo, vagas, dia, turno, disciplinaId, professorId, usuarioId }) {
    if (!codigo || !vagas || !dia || !turno || !disciplinaId || !professorId) {
      throw createAppError('PARAMETRO_INVALIDO', {
        message: 'Todos os campos são obrigatórios: codigo, vagas, dia, turno, disciplinaId, professorId.',
      });
    }

    if (dia < 1 || dia > 7 || turno < 1 || turno > 3) {
      throw createAppError('PARAMETRO_INVALIDO', {
        message: 'Dia deve estar entre 1-7 e turno entre 1-3.',
      });
    }

    const disciplina = await DisciplinaRepository.findById(disciplinaId);
    if (!disciplina) {
      throw createAppError('DISCIPLINA_INEXISTENTE');
    }

    const professor = await ProfessorRepository.findById(professorId);
    if (!professor) {
      throw createAppError('PROFESSOR_INEXISTENTE');
    }

    if (usuarioId) {
      const userRoles = Array.isArray(usuarioId.roles) ? usuarioId.roles : usuarioId.roles ? [usuarioId.roles] : [];
      const isAdmin = userRoles.includes('ADMIN');
      if (!isAdmin && professorId !== usuarioId.id) {
        throw createAppError('ROLE_FORBIDDEN', {
          message: 'Professores só podem criar turmas para si mesmos.',
        });
      }
    }

    const turmaExistente = await TurmaRepository.findByCodigo(codigo);
    if (turmaExistente) {
      throw createAppError('TURMA_CODIGO_DUPLICADO');
    }

    const turma = await TurmaRepository.create({
      codigo,
      vagas,
      dia,
      turno,
      disciplinaId,
      professorId,
    });

    const turmas = await TurmaRepository.findAll();
    const turmaCompleta = turmas.find((t) => t.id === turma.id) || turma;

    return this.buildTurmaResponse(turmaCompleta);
  }

  async atualizar(turmaId, { codigo, vagas, dia, turno, disciplinaId, professorId, usuarioId }) {
    const turmaExistente = await TurmaRepository.findById(turmaId);
    if (!turmaExistente) {
      throw createAppError('TURMA_INEXISTENTE');
    }

    if (dia !== undefined && (dia < 1 || dia > 7)) {
      throw createAppError('PARAMETRO_INVALIDO', {
        message: 'Dia deve estar entre 1-7.',
      });
    }
    if (turno !== undefined && (turno < 1 || turno > 3)) {
      throw createAppError('PARAMETRO_INVALIDO', {
        message: 'Turno deve estar entre 1-3.',
      });
    }

    if (disciplinaId) {
      const disciplina = await DisciplinaRepository.findById(disciplinaId);
      if (!disciplina) {
        throw createAppError('DISCIPLINA_INEXISTENTE');
      }
    }

    if (professorId) {
      const professor = await ProfessorRepository.findById(professorId);
      if (!professor) {
        throw createAppError('PROFESSOR_INEXISTENTE');
      }

      const userRoles = Array.isArray(usuarioId?.roles) ? usuarioId.roles : usuarioId?.roles ? [usuarioId.roles] : [];
      const isAdmin = userRoles.includes('ADMIN');
      if (!isAdmin && turmaExistente.professor_id !== usuarioId?.id) {
        throw createAppError('ROLE_FORBIDDEN', {
          message: 'Professores só podem atualizar suas próprias turmas.',
        });
      }
    }

    if (codigo) {
      const turmaComCodigo = await TurmaRepository.findByCodigo(codigo);
      if (turmaComCodigo && turmaComCodigo.id !== turmaId) {
        throw createAppError('TURMA_CODIGO_DUPLICADO');
      }
    }

    const turmaAtualizada = await TurmaRepository.update(turmaId, {
      codigo,
      vagas,
      dia,
      turno,
      disciplinaId,
      professorId,
    });

    if (!turmaAtualizada) {
      throw createAppError('TURMA_INEXISTENTE');
    }

    const turmas = await TurmaRepository.findAll();
    const turmaCompleta = turmas.find((t) => t.id === turmaId) || turmaAtualizada;

    return this.buildTurmaResponse(turmaCompleta);
  }

  async listar() {
    const turmas = await TurmaRepository.findAll();

    return turmas.map((turma) => this.buildTurmaResponse(turma));
  }

  async buscarPorId(turmaId) {
    const turma = await TurmaRepository.findById(turmaId);
    if (!turma) {
      throw createAppError('TURMA_INEXISTENTE');
    }

    const turmas = await TurmaRepository.findAll();
    const turmaCompleta = turmas.find((t) => t.id === turmaId) || turma;

    return this.buildTurmaResponse(turmaCompleta);
  }

  async excluir(turmaId, usuarioId) {
    const turma = await TurmaRepository.findById(turmaId);
    if (!turma) {
      throw createAppError('TURMA_INEXISTENTE');
    }

    const userRoles = Array.isArray(usuarioId?.roles) ? usuarioId.roles : usuarioId?.roles ? [usuarioId.roles] : [];
    const isAdmin = userRoles.includes('ADMIN');
    if (!isAdmin && turma.professor_id !== usuarioId?.id) {
      throw createAppError('ROLE_FORBIDDEN', {
        message: 'Professores só podem excluir suas próprias turmas.',
      });
    }

    const matriculasAtivas = await MatriculaRepository.countMatriculasAtivasNaTurma(turmaId);
    if (matriculasAtivas > 0) {
      throw createAppError('TURMA_COM_MATRICULAS');
    }

    const resultado = await TurmaRepository.delete(turmaId);
    if (!resultado) {
      throw createAppError('TURMA_INEXISTENTE');
    }
  }

  buildTurmaResponse(turma) {
    if (!turma || !turma.dia || !turma.turno) {
      return {
        id: turma.id,
        codigo: turma.codigo,
        vagas: turma.vagas,
        disciplinaId: turma.disciplina_id,
        professorId: turma.professor_id,
      };
    }

    const horario = new Horario(turma.dia, turma.turno);
    const matriculados = turma.matriculados ?? 0;
    const vagasDisponiveis = Math.max(0, (turma.vagas ?? 0) - matriculados);

    return {
      id: turma.id,
      codigo: turma.codigo,
      vagas: turma.vagas,
      vagasDisponiveis,
      matriculados,
      horario: {
        dia: turma.dia,
        turno: turma.turno,
        codigo: horario.codigo(),
        descricao: horario.getDescricao(),
      },
      disciplina: turma.disciplina_id
        ? {
            id: turma.disciplina_id,
            codigo: turma.disciplina_codigo,
            nome: turma.disciplina_nome,
            creditos: turma.disciplina_creditos,
          }
        : null,
      professor: turma.professor_id
        ? {
            id: turma.professor_id,
            nome: turma.professor_nome,
            siape: turma.professor_siape,
          }
        : null,
    };
  }
}

export default new TurmaService();

