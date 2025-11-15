import { StatusMatricula } from './StatusMatricula.js';

export class Matricula {
  constructor(id, data, status, alunoId, turmaId) {
    this.id = id;
    this.data = data instanceof Date ? data : new Date(data);
    this.status = status || StatusMatricula.ATIVA;
    this.alunoId = alunoId;
    this.turmaId = turmaId;
  }

  estaAtiva() {
    return this.status === StatusMatricula.ATIVA;
  }

  estaCancelada() {
    return this.status === StatusMatricula.CANCELADA;
  }

  cancelar() {
    this.status = StatusMatricula.CANCELADA;
  }

  reativar() {
    this.status = StatusMatricula.ATIVA;
  }
}

