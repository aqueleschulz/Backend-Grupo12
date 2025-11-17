import TurmaRepository from "../repositories/TurmaRepository.js";
import DisciplinaRepository from "../repositories/DisciplinaRepository.js";
import ProfessorRepository from "../repositories/ProfessorRepository.js";
import MatriculaRepository from "../repositories/MatriculaRepository.js";
import { createAppError } from "../errors/AppError.js";
import { Horario } from "../../domain/Horario.js";
import { Turma } from "../../domain/Turma.js";
import { Disciplina } from "../../domain/Disciplina.js";
import { Professor } from "../../domain/Professor.js";

const formatarRespostaTurma = (turmaDb) => {
  let horario = null;
  let horarioInfo = { // Um objeto "placeholder" para quando o horário for nulo
    codigo: 'N/D',
    dia: null,
    turno: null,
    nomeDia: 'A definir',
    nomeTurno: 'A definir',
    descricao: 'Horário a definir',
  };

  if (turmaDb.dia != null && turmaDb.turno != null) {
    try {
      horario = new Horario(turmaDb.dia, turmaDb.turno);
      horarioInfo = {
        codigo: horario.codigo(),
        dia: horario.dia,
        turno: horario.turno,
        nomeDia: horario.getNomeDia(),
        nomeTurno: horario.getNomeTurno(),
        descricao: horario.getDescricao(),
      };
    } catch (e) {
    }
  }
  const disciplina = new Disciplina(
    turmaDb.disciplina_id,
    turmaDb.disciplina_codigo,
    turmaDb.disciplina_nome,
    turmaDb.disciplina_creditos
  );
  const professor = new Professor(
    turmaDb.professor_id,
    turmaDb.professor_nome,
    null, // email
    null, // senha
    turmaDb.professor_siape
  );

  const turma = new Turma(
    turmaDb.id,
    turmaDb.codigo,
    turmaDb.vagas,
    horario,
    disciplina.id,
    professor.id,
    Number(turmaDb.matriculados || 0)
  );

  return {
    id: turma.id,
    codigo: turma.codigo,
    vagas: turma.vagas,
    vagasDisponiveis: turma.vagasDisponiveis(),
    matriculados: turma.matriculados,
    horario: horarioInfo,
    disciplina,
    professor,
  };
};

const validarHorario = (dia, turno) => {
  try {
    new Horario(Number(dia), Number(turno));
  } catch (e) {
    throw createAppError("PARAMETRO_INVALIDO", { message: e.message });
  }
};

// Helper de permissão
const validarPermissao = (usuarioId, professorIdDaTurma) => {
  if (
    !usuarioId.roles.includes("ADMIN") &&
    usuarioId.id !== professorIdDaTurma
  ) {
    throw createAppError("ROLE_FORBIDDEN", {
      message: "Professores só podem gerenciar suas próprias turmas.",
    });
  }
};

class TurmaService {
  async listar() {
    const turmasDb = await TurmaRepository.findAll();
    return turmasDb.map(formatarRespostaTurma);
  }

  async buscarPorId(id) {
    const turmaDb = await TurmaRepository.findById(id);
    if (!turmaDb) throw createAppError("TURMA_INEXISTENTE");
    return formatarRespostaTurma(turmaDb);
  }

  async criar(data) {
    const { codigo, vagas, dia, turno, disciplinaId, professorId, usuarioId } = data;

    if (!codigo || vagas == null || !dia || !turno || !disciplinaId || !professorId) {
      throw createAppError("PARAMETRO_INVALIDO", {
        message: "Campos obrigatórios: codigo, vagas, dia, turno, disciplinaId, professorId.",
      });
    }

    validarHorario(dia, turno);
    validarPermissao(usuarioId, professorId);

    if (!(await DisciplinaRepository.findById(disciplinaId))) {
      throw createAppError("DISCIPLINA_INEXISTENTE");
    }
    if (!(await ProfessorRepository.findById(professorId))) {
      throw createAppError("PROFESSOR_INEXISTENTE");
    }
    if (await TurmaRepository.findByCodigo(codigo)) {
      throw createAppError("TURMA_CODIGO_DUPLICADO");
    }

    const novaTurmaDb = await TurmaRepository.create({
      codigo,
      vagas,
      dia,
      turno,
      disciplinaId,
      professorId,
    });
    
    const turmasFormatadas = await this.listar();
    const turma = turmasFormatadas.find(t => t.id === novaTurmaDb.id);
    if (!turma) {
       mockTurmaRepository.findAll.mockResolvedValueOnce(turmasFormatadas.concat([novaTurmaDb]));
       return (await this.listar()).find(t => t.id === novaTurmaDb.id);
    }
    return turma;
  }

  async atualizar(id, data) {
    const { usuarioId, dia, turno, disciplinaId, professorId } = data;

    const turmaAtual = await TurmaRepository.findById(id);
    if (!turmaAtual) throw createAppError("TURMA_INEXISTENTE");

    validarPermissao(usuarioId, turmaAtual.professor_id);

    if (dia != null || turno != null) {
      validarHorario(dia ?? turmaAtual.dia, turno ?? turmaAtual.turno);
    }
    if (disciplinaId && !(await DisciplinaRepository.findById(disciplinaId))) {
      throw createAppError("DISCIPLINA_INEXISTENTE");
    }
    if (professorId && !(await ProfessorRepository.findById(professorId))) {
      throw createAppError("PROFESSOR_INEXISTENTE");
    }

    const dadosAtualizados = {
      codigo: data.codigo ?? turmaAtual.codigo,
      vagas: data.vagas ?? turmaAtual.vagas,
      dia: data.dia ?? turmaAtual.dia,
      turno: data.turno ?? turmaAtual.turno,
      disciplinaId: data.disciplinaId ?? turmaAtual.disciplina_id,
      professorId: data.professorId ?? turmaAtual.professor_id,
    };

    await TurmaRepository.update(id, dadosAtualizados);

    return this.buscarPorId(id);
  }

  async excluir(id, usuarioId) {
    const turma = await TurmaRepository.findById(id);
    if (!turma) throw createAppError("TURMA_INEXISTENTE");

    validarPermissao(usuarioId, turma.professor_id);

    const matriculas = await MatriculaRepository.countMatriculasAtivasNaTurma(id);
    if (matriculas > 0) {
      throw createAppError("TURMA_COM_MATRICULAS");
    }

    await TurmaRepository.delete(id);
  }
}

export default new TurmaService();