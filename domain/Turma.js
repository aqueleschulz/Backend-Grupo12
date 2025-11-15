import { Horario } from './Horario.js';

export class Turma {
  constructor(id, codigo, vagas, horario, disciplinaId, professorId, matriculados = 0) {
    this.id = id;
    this.codigo = codigo;
    this.vagas = vagas;
    this.horario = horario instanceof Horario ? horario : new Horario(horario.dia, horario.turno);
    this.disciplinaId = disciplinaId;
    this.professorId = professorId;
    this.matriculados = matriculados;
  }

  vagasDisponiveis() {
    return Math.max(0, this.vagas - this.matriculados);
  }

  temVagasDisponiveis() {
    return this.vagasDisponiveis() > 0;
  }

  incrementarMatriculados() {
    this.matriculados += 1;
  }

  decrementarMatriculados() {
    if (this.matriculados > 0) {
      this.matriculados -= 1;
    }
  }
}

