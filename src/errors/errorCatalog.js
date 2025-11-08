export const ERROR_CATALOG = {
  TURMA_INEXISTENTE: {
    statusCode: 400,
    message: 'Turma não encontrada.',
  },
  JA_MATRICULADO_NA_TURMA: {
    statusCode: 409,
    message: 'Aluno já matriculado nesta turma.',
  },
  SEM_VAGAS: {
    statusCode: 409,
    message: 'Turma sem vagas disponíveis.',
  },
  CHOQUE_HORARIO: {
    statusCode: 409,
    message: 'Aluno já possui matrícula ativa nesse horário.',
  },
  MATRICULA_NAO_ENCONTRADA: {
    statusCode: 404,
    message: 'Matrícula não encontrada.',
  },
  MATRICULA_FORBIDDEN: {
    statusCode: 403,
    message: 'Matrícula não pertence ao aluno autenticado.',
  },
  ALUNO_NAO_ENCONTRADO: {
    statusCode: 404,
    message: 'Aluno não encontrado para o usuário autenticado.',
  },
  TOKEN_AUSENTE: {
    statusCode: 401,
    message: 'Token ausente.',
  },
  TOKEN_INVALIDO: {
    statusCode: 401,
    message: 'Token inválido.',
  },
  ROLE_FORBIDDEN: {
    statusCode: 403,
    message: 'Usuário não possui permissão para acessar este recurso.',
  },
  PARAMETRO_INVALIDO: {
    statusCode: 400,
    message: 'Parâmetros inválidos.',
  },
  ERRO_INTERNO: {
    statusCode: 500,
    message: 'Erro interno.',
  },
};

export const ACTIVE_MATRICULA_STATUSES = ['ATIVA', 'EM_ANDAMENTO', 'APROVADA'];
