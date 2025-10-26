import React from 'react';

const ClassCard = ({ 
  title, 
  turma, 
  professor, 
  schedule, 
  status, // 'disponivel', 'solicitado', 'matriculado', 'encerrada', 'proximo'
  progress // 0 a 100 (para MyClasses)
}) => {
  
  let buttonText;
  let buttonClass;
  let showProgress = false;
  let showTag = false;
  let tagText = '';
  let tagClass = '';

  // Lógica de status e botões
  if (status === 'disponivel') {
    buttonText = 'Solicitar Matrícula';
    buttonClass = 'btn-solicitar';
  } else if (status === 'solicitado') {
    buttonText = 'Já Solicitado';
    buttonClass = 'btn-solicitado';
  } else if (status === 'matriculado') {
    buttonText = 'Acessar Disciplina';
    buttonClass = 'btn-acessar';
    showProgress = true;
  } else if (status === 'encerrada') {
    buttonText = 'Disciplina Encerrada';
    buttonClass = 'btn-encerrada';
    showProgress = true;
  } else if (status === 'proximo') {
    buttonText = 'Disponível Próximo Bimestre';
    buttonClass = 'btn-solicitado';
    showTag = true;
    tagText = 'Pré-Requisito Necessário';
    tagClass = 'tag-warning';
  }

  // Lógica de Ação (Apenas para demonstração de clique)
  const handleAction = () => {
    if (status === 'disponivel') {
      alert(`Matrícula solicitada para: ${title}`);
    } else if (status === 'matriculado') {
      alert(`Acessando a disciplina: ${title}`);
    }
  };

  return (
    <div className="class-card">
      <div className="class-header">
        <h3>{title}</h3>
        <p>{turma}</p>
      </div>
      <div className="class-body">
        <div className="class-info">
          <div className="prof-icon-placeholder"></div>
          <span>{professor}</span>
        </div>
        <p className="class-schedule">{schedule}</p>
        
        {/* Barra de Progresso (Visível em MyClasses/Turmas Matriculadas) */}
        {(showProgress || (status === 'solicitado' && progress !== undefined)) && (
          <>
            <div className="class-status-bar">
              <div 
                className="class-progress" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {status !== 'encerrada' && <p style={{ fontSize: '0.8rem', color: progress === 100 ? 'var(--success-color)' : 'var(--gray-dark)', marginBottom: '5px' }}>{progress}% Concluído</p>}
          </>
        )}
        
        {/* Tag de Status (Visível em Home/Turmas Disponíveis) */}
        {showTag && (
          <div style={{ marginBottom: '15px' }}>
            <span className={`status-tag ${tagClass}`}>{tagText}</span>
          </div>
        )}

        <button 
          className={`class-action-button ${buttonClass}`}
          onClick={handleAction}
          disabled={status !== 'disponivel' && status !== 'matriculado'}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ClassCard;