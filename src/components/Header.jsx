import React from 'react';

const Header = ({ userName, onLogout, systemName, logo }) => {
  return (
    <header className="header">
      <div className="header-left">
        <span className="logo-text">{logo}</span>
        <span>{systemName}</span>
      </div>
      <div className="header-right">
        <span className="user-name">{userName}</span>
        {/* Placeholder para o ícone do usuário/logout */}
        <div className="user-icon-placeholder" onClick={onLogout} title="Sair"></div>
      </div>
    </header>
  );
};

export default Header;