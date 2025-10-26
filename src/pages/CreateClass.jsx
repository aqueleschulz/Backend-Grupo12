import React, { useState } from 'react';

const CreateClass = () => {
  // Estado para simular a pré-visualização no cabeçalho
  const [materia, setMateria] = useState('Prog. Orientada a Objetos');
  const [turma, setTurma] = useState('Turma 2-1');
  const professor = 'Prof. Dr. Fulano'; // Professor fixo para simulação

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Turma criada (Simulação de Envio)');
  };

  return (
    <div className="content-area">
      <h2 className="page-title">PRÉ-VISUALIZAÇÃO | CRIAÇÃO DE TURMA</h2>
      
      <div className="create-class-form-container">
        {/* Pré-visualização da Turma - Fiel ao MatrículasCreateClass.png */}
        <div className="class-preview-header">
          <h2>{materia}</h2>
          <p>{turma}</p>
        </div>
        
        <div className="professor-info">
          <div className="prof-icon-placeholder"></div>
          <span>{professor}</span>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          
          <div className="form-group">
            <label htmlFor="materia">Matéria</label>
            <input 
              id="materia"
              type="text" 
              placeholder="Digite aqui..." 
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="alunos">Quantidade de Alunos</label>
            <input 
              id="alunos"
              type="number" 
              placeholder="Digite aqui..." 
            />
          </div>

          <div className="form-group">
            <label htmlFor="turma">Turma</label>
            <input 
              id="turma"
              type="text" 
              placeholder="Ex: Turma 2-1" 
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="diaSemana">Dia da Semana | Período</label>
            <input 
              id="diaSemana"
              type="text" 
              placeholder="Digite aqui..." 
            />
          </div>
          
          <div className="form-group">
            <label>Horário</label>
            <div className="form-group-inline">
              <input 
                type="text" 
                placeholder="Digite aqui..." 
              />
              <input 
                type="text" 
                placeholder="Digite aqui..." 
              />
            </div>
          </div>

          {/* Adicione mais campos de formulário conforme necessário */}
          
          {/* Botão de Criação (Placeholder) */}
          <div className="form-group form-group-full" style={{ marginTop: '20px' }}>
            <button type="submit" className="class-action-button btn-solicitar" style={{ width: 'auto', padding: '15px' }}>
              Criar Turma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClass;