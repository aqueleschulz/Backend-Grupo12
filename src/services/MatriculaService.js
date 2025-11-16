import { createAppError } from "../errors/AppError.js";
import MatriculaRepository from "../repositories/MatriculaRepository.js";
import TurmaRepository from "../repositories/TurmaRepository.js";
import { withTransaction } from "../db/pool.js";
import db from "../db/pool.js";

const buildMatriculaResponse = (matricula, turma) => ({
  id: matricula.id,
  alunoId: matricula.aluno_id,
  turmaId: matricula.turma_id,
  horarioCodigo: TurmaRepository.getHorarioCodigo(turma),
  status: matricula.status ?? "ATIVA",
  criadoEm: matricula.data,
});

class MatriculaService {

  async enroll({ alunoId, turmaId }) {
    if (!turmaId) {
      throw createAppError("TURMA_INEXISTENTE");
    }

    const matricula = await withTransaction(
      async (client) => {
        // Evita dupla matrícula concorrente
        await client.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))",
          [turmaId]
        );

        // Verifica se a turma existe
        const turma = await TurmaRepository.findById(turmaId, {
          client,
          forUpdate: true,
        });
        if (!turma) {
          throw createAppError("TURMA_INEXISTENTE");
        }

        // Verifica matrícula duplicada
        const jaMatriculado =
          await MatriculaRepository.existsMatriculaAtivaDoAlunoNaTurma(
            alunoId,
            turmaId,
            { client }
          );

        if (jaMatriculado) {
          throw createAppError("JA_MATRICULADO_NA_TURMA");
        }

        // Verifica vagas
        const ocupadas = Number(
          await MatriculaRepository.countMatriculasAtivasNaTurma(turmaId, {
            client,
          })
        );
        const capacidade =
          turma.vagas == null ? Number.POSITIVE_INFINITY : Number(turma.vagas);

        if (
          Number.isFinite(capacidade) &&
          Number.isFinite(ocupadas) &&
          ocupadas >= capacidade
        ) {
          throw createAppError("SEM_VAGAS");
        }

        // Verifica choque de horário
        const horarioAluno =
          await MatriculaRepository.listHorariosCodigoAtivosDoAluno(alunoId, {
            client,
          });
        const horarioTurma = TurmaRepository.getHorarioCodigo(turma);

        if (horarioTurma && horarioAluno.includes(horarioTurma)) {
          throw createAppError("CHOQUE_HORARIO");
        }

        // Cria a matrícula
        const novaMatricula = await MatriculaRepository.insertMatricula(
          { alunoId, turmaId },
          { client }
        );

        return buildMatriculaResponse(novaMatricula, turma);
      },
      { isolationLevel: "SERIALIZABLE", retries: 2 }
    );

    return matricula;
  }


  // CANCELAR MATRÍCULA

  async cancel({ alunoId, matriculaId }) {
    const matricula = await MatriculaRepository.findMatriculaDoAluno(
      matriculaId,
      alunoId
    );

    if (!matricula) {
      throw createAppError("MATRICULA_NAO_ENCONTRADA");
    }

    if (matricula.aluno_id !== alunoId) {
      throw createAppError("MATRICULA_FORBIDDEN");
    }

    await MatriculaRepository.cancelarMatricula(matriculaId);
  }


  // LISTAR MATRÍCULAS DO ALUNO (PAINEL DO ALUNO)

  async listByAluno(alunoId) {
    const matriculas =
      await MatriculaRepository.listMatriculasDoAluno(alunoId);

    return matriculas.map((matricula) => ({
      id: matricula.id,
      alunoId: matricula.aluno_id,
      turmaId: matricula.turma_id,
      status: matricula.status ?? "ATIVA",
      turmaCodigo: matricula.turma_codigo,
      disciplinaNome: matricula.disciplina_nome,
      professorNome: matricula.professor_nome,
      horarioCodigo: matricula.horario_codigo,
      criadoEm: matricula.data,
    }));
  }


  //  LISTAR TODAS AS MATRÍCULAS (ADMIN)

  async listAll() {
    const sql = `
      SELECT 
        m.id,
        m.aluno_id,
        m.turma_id,
        m.data,
        m.status
      FROM matricula m
      ORDER BY m.data DESC
    `;

    const result = await db.query(sql);
    return result.rows;
  }
}

export default new MatriculaService();


