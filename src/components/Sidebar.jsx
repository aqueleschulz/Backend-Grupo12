import React from 'react';

const Sidebar = ({ onNavigate, currentView }) => {
  // A sidebar terá 4 itens placeholder de ícones, como nos mockups.
  // Poderíamos adicionar classes ativas para destacar o item selecionado.
  
  // Exemplo de itens de navegação (apenas para simular o clique)
  const navItems = [
    { id: 'home', label: 'Turmas Disponíveis' },
    { id: 'myclasses', label: 'Minhas Turmas' },
    { id: 'createclass', label: 'Criar Turma (Admin)' },
    { id: 'reports', label: 'Relatórios (Admin)' },
  ];

  return (
    <nav className="sidebar">
      {navItems.map((item, index) => (
        <div 
          key={item.id} 
          className="sidebar-item-placeholder" 
          title={item.label}
          onClick={() => onNavigate(item.id)}
          style={{ 
            opacity: currentView === item.id ? 1 : 0.6,
            cursor: 'pointer'
          }}
        >
          {/* O cinza avermelhado será o placeholder */}
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;