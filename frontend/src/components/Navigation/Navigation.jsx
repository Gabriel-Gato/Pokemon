import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Home', width: 122, path: '/' },
    { label: 'Pokedex', width: 171, path: '/pokedex' },
    { label: 'TCG', width: 89, path: '/tcg' },
    { label: 'Competitivo', width: 243, path: '/competitivo' }
  ];

  const handleUserClick = () => {
    navigate('/login');
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };


  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="menu-items">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
            style={{ width: `${item.width}px` }}
            onClick={() => handleMenuClick(item.path)}
          >
            <span className="menu-text">{item.label}</span>
            <div className="menu-underline"></div>
          </div>
        ))}
      </div>
      
      <div className="user-section" onClick={handleUserClick}>
        <div className="user-icon">
          <img 
            src="/icons8-usuário-60 1.png" 
            alt="Usuário"
            className="user-image"
          />
          <div className="user-circle"></div>
        </div>
        <div className="user-text">
          <span>Entre Aqui</span>
          <div className="user-underline"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;