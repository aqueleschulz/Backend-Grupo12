import bcrypt from 'bcryptjs';

// Comparar a senha que o usuário digitou.
async function compare(senhaPura, senhaHash) {
  return bcrypt.compare(senhaPura, senhaHash);
}

// Gerar o hash da senha pura.
async function hash(senhaPura) {
  const saltRounds = 10;
  return bcrypt.hash(senhaPura, saltRounds);
}

export const PasswordHasher = {
  compare,
  hash,
};