import { Role } from './Role.js';

export class Usuario {
  constructor(id, nome, email, senhaHash, roles = []) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this._senhaHash = senhaHash;
    this.roles = roles instanceof Set ? roles : new Set(roles);
  }

  get senhaHash() {
    return this._senhaHash;
  }

  temRole(role) {
    return this.roles.has(role);
  }

  adicionarRole(role) {
    this.roles.add(role);
  }

  removerRole(role) {
    this.roles.delete(role);
  }
}

