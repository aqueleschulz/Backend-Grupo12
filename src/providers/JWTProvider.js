import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Criar o token (assinar)
function sign(payload) {
  const secret = env.jwtSecret;

  if (!secret) {
    // Garantir que a secret foi carregada
    throw new Error('JWT_SECRET não está definida no .env');
  }

  // Criar o token
  const token = jwt.sign(payload, secret, {
    expiresIn: '1h'
  });

  return token;
}

export const JWTProvider = {
  sign,
};