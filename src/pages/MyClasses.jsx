import React, { useState } from 'react';
import ClassCard from '../components/ClassCard';

// Dados simulados para a página MyClasses (Turmas do Aluno)
const myClassesData = [
  { id: 1, title: 'Programação Front-end', turma: 'Turma 2-1', professor: 'Prof. Dr. Fulano', schedule: 'Segunda-feira | 08:30 - 09:30', status: 'encerrada', progress: 100, category: 'Eng. Soft' },
  { id: 2, title: 'Programação Web', turma: 'Turma 3-2', professor: 'Prof. Dr. Fulano', schedule: 'Terça-feira | 14:30 - 15:30', status: 'matriculado', progress: 25, category: 'Eng. Soft' },
  { id: 3, title: 'Raciocínio Lógico', turma: 'Turma 3-3', professor: 'Prof. Dr. Fulano', schedule: 'Quinta-feira | 20:30 - 21:30', status: 'matriculado', progress: 0, category: 'Eng. Soft' },
  { id: 4, title: 'Álgebra Linear', turma: 'Turma 1-2', professor: 'Prof. Dr. Beltrano', schedule: 'Quarta-feira | 16:00 - 17:00', status: 'matriculado', progress: 75, category: 'Matemática' },
];

const categories = ['Eng. Soft', 'Matemática'];

const MyClasses = () => {
  const [activeCategory, setActiveCategory] = useState('Eng. Soft'); // Simular o filtro ativo

  const filteredClasses = myClassesData.filter(c => c.category === activeCategory);

  return (
    <div className="content-area">
      <h2 className="page-title">Turmas Para Acessar</h2>
      
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
            schedule={classData.schedule}
            status={classData.status}
            progress={classData.progress}
          />
        ))}
      </div>
    </div>
  );
};

export default MyClasses;