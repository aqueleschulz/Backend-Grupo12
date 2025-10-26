import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import MyClasses from './pages/MyClasses';
import CreateClass from './pages/CreateClass';
import './index.css'; // Importa os estilos globais

const App = () => {
  // Simulação de login: 'aluno' ou 'institucional'
  const [userRole, setUserRole] = useState('aluno'); 
  // Simulação de navegação: 'home', 'myclasses', 'createclass'
  const [currentView, setCurrentView] = useState('home'); 
  const userName = userRole === 'institucional' ? 'nome (Institucional)' : 'nome (Aluno)';

  const handleLogout = () => {
    alert('Simulação de Logout');
    setUserRole('aluno');
    setCurrentView('home');
  };

  const handleNavigate = (view) => {
    if (view === 'createclass' && userRole === 'aluno') {
      alert('Acesso negado. Apenas usuários institucionais podem criar turmas.');
      return;
    }
    setCurrentView(view);
  };
  
  // Renderização condicional da página
  const renderPage = () => {
    switch (currentView) {
      case 'myclasses':
        return <MyClasses />;
      case 'createclass':
        return <CreateClass />;
      case 'home':
      default:
        // O FAB Button (+) é exibido apenas na Home para usuários institucionais
        return <Home showFabButton={userRole === 'institucional'} />; 
    }
  };

  return (
    <div className="app-container">
      <Header 
        userName={userName} 
        onLogout={handleLogout} 
        systemName="Sistema de Matrículas Online"
        logo="LOGOTIPO"
      />
      <div className="main-content-area">
        <Sidebar 
          onNavigate={handleNavigate} 
          currentView={currentView}
        />
        <main className="content-area-wrapper">
          {renderPage()}
        </main>
      </div>
      
      {/* FAB Button para usuários institucionais na Home */}
      {currentView === 'home' && userRole === 'institucional' && (
        <button className="fab-button" onClick={() => handleNavigate('createclass')}>
          +
        </button>
      )}
    </div>
  );
};

export default App;