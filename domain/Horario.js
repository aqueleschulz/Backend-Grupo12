export const DiaSemana = {
  DOMINGO: 1,
  SEGUNDA: 2,
  TERCA: 3,
  QUARTA: 4,
  QUINTA: 5,
  SEXTA: 6,
  SABADO: 7,
};

export const Turno = {
  MANHA: 1,
  TARDE: 2,
  NOITE: 3,
};

const NOMES_DIAS = {
  [DiaSemana.DOMINGO]: 'Domingo',
  [DiaSemana.SEGUNDA]: 'Segunda-feira',
  [DiaSemana.TERCA]: 'Terça-feira',
  [DiaSemana.QUARTA]: 'Quarta-feira',
  [DiaSemana.QUINTA]: 'Quinta-feira',
  [DiaSemana.SEXTA]: 'Sexta-feira',
  [DiaSemana.SABADO]: 'Sábado',
};

const NOMES_TURNOS = {
  [Turno.MANHA]: 'Manhã',
  [Turno.TARDE]: 'Tarde',
  [Turno.NOITE]: 'Noite',
};

export class Horario {
  constructor(dia, turno) {
    if (dia == null || turno == null) {
      throw new Error('Dia e turno são obrigatórios');
    }
    if (dia < 1 || dia > 7) {
      throw new Error('Dia deve estar entre 1 e 7');
    }
    if (turno < 1 || turno > 3) {
      throw new Error('Turno deve estar entre 1 e 3');
    }
    this.dia = dia;
    this.turno = turno;
  }

  codigo() {
    return `${this.dia}${this.turno}`;
  }

  getNomeDia() {
    return NOMES_DIAS[this.dia] || `Dia ${this.dia}`;
  }

  getNomeTurno() {
    return NOMES_TURNOS[this.turno] || `Turno ${this.turno}`;
  }

  getDescricao() {
    return `${this.getNomeDia()} - ${this.getNomeTurno()}`;
  }

  static fromCodigo(codigo) {
    if (!codigo || codigo.length !== 2) {
      throw new Error('Código de horário deve ter exatamente 2 caracteres');
    }
    const dia = parseInt(codigo[0], 10);
    const turno = parseInt(codigo[1], 10);
    return new Horario(dia, turno);
  }

  static criar(dia, turno) {
    return new Horario(dia, turno);
  }

  equals(outro) {
    if (!(outro instanceof Horario)) {
      return false;
    }
    return this.dia === outro.dia && this.turno === outro.turno;
  }
}

