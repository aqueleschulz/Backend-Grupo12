export class Disciplina {
  constructor(id, codigo, nome, creditos, prerequisitos = []) {
    this.id = id;
    this.codigo = codigo;
    this.nome = nome;
    this.creditos = creditos;
    this.prerequisitos = prerequisitos;
  }

  adicionarPreRequisito(disciplina) {
    if (!(disciplina instanceof Disciplina)) {
      throw new Error('Pré-requisito deve ser uma instância de Disciplina');
    }
    if (!this.prerequisitos.find(d => d.id === disciplina.id)) {
      this.prerequisitos.push(disciplina);
    }
  }

  removerPreRequisito(disciplinaId) {
    this.prerequisitos = this.prerequisitos.filter(d => d.id !== disciplinaId);
  }

  temPreRequisito(disciplinaId) {
    return this.prerequisitos.some(d => d.id === disciplinaId);
  }
}

