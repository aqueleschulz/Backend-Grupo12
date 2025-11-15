import { Usuario } from './Usuario.js';
import { Role } from './Role.js';

export class Professor extends Usuario {
  constructor(id, nome, email, senhaHash, siape, roles = [Role.PROFESSOR]) {
    super(id, nome, email, senhaHash, roles);
    this.siape = siape;
  }
}

