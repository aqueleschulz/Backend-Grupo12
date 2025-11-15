import { Usuario } from './Usuario.js';
import { Role } from './Role.js';

export class Aluno extends Usuario {
  constructor(id, nome, email, senhaHash, ra, roles = [Role.ALUNO]) {
    super(id, nome, email, senhaHash, roles);
    this.ra = ra;
  }
}

