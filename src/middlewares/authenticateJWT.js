import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { createAppError } from '../errors/AppError.js';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createAppError('TOKEN_AUSENTE');
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    throw createAppError('TOKEN_INVALIDO');
  }
};

export default authenticateJWT;
