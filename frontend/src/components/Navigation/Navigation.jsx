import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(UserContext);

  const menuItems = [
    { label: 'Home', width: 122, path: '/' },
    { label: 'Pokedex', width: 171, path: '/pokedex' },
    { label: 'TCG', width: 89, path: '/tcg' },
    { label: 'Competitivo', width: 243, path: '/competitivo' }
  ];

  const handleUserClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/perfil');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (path) => navigate(path);
  const isActive = (path) => location.pathname === path;


  const handleImageError = (e) => {
    e.target.style.display = 'none';

    const userIcon = e.target.parentElement;
    userIcon.classList.add('show-default-icon');
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

      <div className="user-section">
        {user && (
          <div className="logout-button" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sair
          </div>
        )}

        <div className="user-profile" onClick={handleUserClick}>
          <div className="user-icon">
            {user?.imagem ? (
              <img
                src={`http://localhost:8080/api/login/imagem/${user.imagem}`}
                alt="Usuário"
                className="user-image"
                onError={handleImageError}
              />
            ) : (
              <div className="default-user-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" fill="white"/>
                  <path d="M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white"/>
                </svg>
              </div>
            )}
          </div>
          <div className="user-text">
            <span>{user ? user.nome : "Entre Aqui"}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;