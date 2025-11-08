import { createAppError } from '../errors/AppError.js';
import AlunoRepository from '../repositories/AlunoRepository.js';

export const attachAlunoId = async (req, res, next) => {
  const userId = req.user?.id ?? req.user?.userId ?? req.user?.sub;

  if (!userId) {
    throw createAppError('TOKEN_INVALIDO', { message: 'Token sem identificador de usuário.' });
  }

  const aluno = await AlunoRepository.findByUsuarioId(userId);

  if (!aluno) {
    throw createAppError('ALUNO_NAO_ENCONTRADO');
  }

  req.alunoId = aluno.id;
  next();
};

export default attachAlunoId;
