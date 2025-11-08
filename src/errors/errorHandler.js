import { AppError } from './AppError.js';
import { ERROR_CATALOG } from './errorCatalog.js';

const isUniqueViolation = (error) => error?.code === '23505';

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (isUniqueViolation(err)) {
    const definition = ERROR_CATALOG.JA_MATRICULADO_NA_TURMA;
    return res.status(definition.statusCode).json({
      error: {
        code: 'JA_MATRICULADO_NA_TURMA',
        message: definition.message,
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);

  return res.status(500).json({
    error: {
      code: 'ERRO_INTERNO',
      message: ERROR_CATALOG.ERRO_INTERNO.message,
    },
  });
};

export default errorHandler;
