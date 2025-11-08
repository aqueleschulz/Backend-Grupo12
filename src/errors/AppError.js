import { ERROR_CATALOG } from './errorCatalog.js';

export class AppError extends Error {
  constructor(code, message, statusCode, details) {
    const definition = ERROR_CATALOG[code];
    super(message ?? definition?.message ?? 'Erro desconhecido.');
    this.name = 'AppError';
    this.code = code ?? 'ERRO_INTERNO';
    this.statusCode = statusCode ?? definition?.statusCode ?? 500;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }
}

export const createAppError = (code, overrides = {}) => {
  const definition = ERROR_CATALOG[code] ?? ERROR_CATALOG.ERRO_INTERNO;
  return new AppError(
    code,
    overrides.message ?? definition.message,
    overrides.statusCode ?? definition.statusCode,
    overrides.details,
  );
};

export default AppError;
