import { createAppError } from "../errors/AppError.js";
import MatriculaRepository from "../repositories/MatriculaRepository.js";
import TurmaRepository from "../repositories/TurmaRepository.js";
import { withTransaction } from "../db/pool.js";

const buildMatriculaResponse = (matricula, turma) => ({
  id: matricula.id,
  alunoId: matricula.aluno_id,
  turmaId: matricula.turma_id,
  horarioCodigo: turma ? `${turma.dia || ''}-${turma.turno || ''}` : null,
  status: matricula.status ?? "ATIVA",
  criadoEm: matricula.data,
});

class MatriculaService {
  async enroll({ alunoId, turmaId }) {
    if (!turmaId) throw createAppError("TURMA_INEXISTENTE");
    const matricula = await withTransaction(async (client) => {
      
      const turma = await TurmaRepository.findById(turmaId, { client, forUpdate: true });
      if (!turma) throw createAppError("TURMA_INEXISTENTE");  

      const ja = await MatriculaRepository.existsMatriculaAtivaDoAlunoNaTurma(alunoId, turmaId, { client });
      if (ja) throw createAppError("JA_MATRICULADO_NA_TURMA");

      const ocupadas = await MatriculaRepository.countMatriculasAtivasNaTurma(turmaId, { client });
      const capacidade = turma.vagas == null ? Number.POSITIVE_INFINITY : Number(turma.vagas);
      if (Number.isFinite(capacidade) && Number.isFinite(ocupadas) && ocupadas >= capacidade) {
        throw createAppError("SEM_VAGAS");
      }

      const horarioAluno = await MatriculaRepository.listHorariosCodigoAtivosDoAluno(alunoId, { client });
      const horarioTurma = TurmaRepository.getHorarioCodigo ? TurmaRepository.getHorarioCodigo(turma) : `${turma.dia||''}-${turma.turno||''}`;
      if (horarioTurma && horarioAluno.includes(horarioTurma)) throw createAppError("CHOQUE_HORARIO");

      const nova = await MatriculaRepository.insertMatricula({ alunoId, turmaId }, { client });
      return buildMatriculaResponse(nova, turma);
    }, { isolationLevel: "SERIALIZABLE", retries: 2 });

    return matricula;
  }

  async cancel({ alunoId, matriculaId }) {
    const matricula = await MatriculaRepository.findMatriculaDoAluno(matriculaId, alunoId);
    if (!matricula) throw createAppError("MATRICULA_NAO_ENCONTRADA");
    if (matricula.aluno_id !== alunoId) throw createAppError("MATRICULA_FORBIDDEN");
    await MatriculaRepository.cancelarMatricula(matriculaId);
  }

  async listByAluno(alunoId) {
    const matriculas = await MatriculaRepository.listMatriculasDoAluno(alunoId);
    return matriculas.map(m => ({
      id: m.id,
      alunoId: m.aluno_id,
      turmaId: m.turma_id,
      status: m.status ?? "ATIVA",
      turmaCodigo: m.turma_codigo,
      disciplinaNome: m.disciplina_nome,
      professorNome: m.professor_nome,
      horarioCodigo: m.horario_codigo,
      criadoEm: m.data
    }));
  }

  async listAll() {
    return MatriculaRepository.listAll();
  }

  async createAdmin({ alunoId, turmaId }) {
    return this.enroll({ alunoId, turmaId });
  }

  async cancelAdmin(id) {
    return MatriculaRepository.cancelarMatricula(id);
  }
}

export default new MatriculaService();
  