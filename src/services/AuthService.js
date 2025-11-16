// Importar os módulos necessários
import { PasswordHasher } from '../providers/PasswordHasher.js';
import { JWTProvider } from '../providers/JWTProvider.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import { createAppError } from '../errors/AppError.js';

async function autenticar({ email, senha }) {
  // Chamar o repositório para buscar o usuário
  const usuario = await UsuarioRepository.findByEmail(email);

  if (!usuario) {
    // Se não achar o usuário, falha.
    throw createAppError('TOKEN_INVALIDO', { message: 'Email ou senha inválidos.' });
  }

  // Chamar o hasher para comparar as senhas
  const senhaValida = await PasswordHasher.compare(senha, usuario.senha_hash);

  if (!senhaValida) {
    // Se a senha estiver errada, falha.
    throw createAppError('TOKEN_INVALIDO', { message: 'Email ou senha inválidos.' });
  }

  // Preparar os dados para o token (o 'payload')
  const payload = {
    id: usuario.id,
    roles: usuario.roles || [],
  };

  // Chamar o provider para criar o token
  const token = JWTProvider.sign(payload);

  // Retornar o 'TokenDTO'
  return { 
    accessToken: token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      roles: payload.roles,
    }
  };
}

export const AuthService = {
  autenticar,
};