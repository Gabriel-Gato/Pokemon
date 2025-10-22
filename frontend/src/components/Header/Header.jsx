import React from 'react';
import Navigation from '../Navigation/Navigation';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <img 
          className="logo" 
          src="Poké_Ball_icon.svg 1.png" 
          alt="Poké Ball" 
        />
        <Navigation />
      </div>
    </header>
  );
};

export default Header;