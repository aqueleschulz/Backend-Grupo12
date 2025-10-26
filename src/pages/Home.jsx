import React, { useState } from 'react';
import ClassCard from '../components/ClassCard';

// Dados simulados para a página Home (Turmas Disponíveis)
const availableClasses = [
  { id: 1, title: 'Prog. Orientada a Objetos', turma: 'Turma 2-1', professor: 'Prof. Dr. Fulano', schedule: 'Segunda-feira | 08:30 - 09:30', status: 'disponivel', category: 'Eng. Soft' },
  { id: 2, title: 'Programação Web', turma: 'Turma 3-2', professor: 'Prof. Dr. Fulano', schedule: 'Terça-feira | 14:30 - 15:30', status: 'solicitado', category: 'Eng. Soft' },
  { id: 3, title: 'Raciocínio Lógico', turma: 'Turma 3-3', professor: 'Prof. Dr. Fulano', schedule: 'Quinta-feira | 20:30 - 21:30', status: 'disponivel', category: 'Eng. Soft' },
  { id: 4, title: 'Arquitetura da Informação', turma: 'Turma 2-1', professor: 'Prof. Dr. Fulano', schedule: 'Segunda-feira | 08:30 - 09:30', status: 'disponivel', category: 'Eng. Soft' },
  { id: 5, title: 'Programação I', turma: 'Turma 2-1', professor: 'Prof. Dr. Fulano', schedule: 'Segunda-feira | 08:30 - 09:30', status: 'disponivel', category: 'Eng. Soft' },
  { id: 6, title: 'Programação II', turma: 'Turma 2-1', professor: 'Prof. Dr. Fulano', schedule: 'Segunda-feira | 08:30 - 09:30', status: 'proximo', category: 'Eng. Soft' },
  { id: 7, title: 'Cálculo I', turma: 'Turma 1-1', professor: 'Prof. Dr. Beltrano', schedule: 'Quarta-feira | 10:00 - 11:00', status: 'disponivel', category: 'Matemática' },
];

const categories = ['Eng. Soft', 'Matemática', 'Período', 'Dia da Semana'];

const Home = ({ showFabButton }) => {
  const [activeCategory, setActiveCategory] = useState('Eng. Soft'); // Simular o filtro ativo

  const filteredClasses = availableClasses.filter(c => c.category === activeCategory || activeCategory === 'Eng. Soft');

  return (
    <div className="content-area">
      <h2 className="page-title">Turmas Disponíveis</h2>
      
      <div className="filter-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-button ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div className="class-grid">
        {filteredClasses.map(classData => (
          <ClassCard
            key={classData.id}
            title={classData.title}
            turma={classData.turma}
            professor={classData.professor}
            status={classData.status}
            // Simular a quantidade de vagas restantes no schedule
            schedule={`${classData.schedule} | 05/15`} 
          />
        ))}
      </div>
      
      {/* FAB (Floating Action Button) - visível se for um usuário institucional */}
      {showFabButton && (
        <button className="fab-button" title="Criar Turma">
          +
        </button>
      )}
    </div>
  );
};

export default Home;