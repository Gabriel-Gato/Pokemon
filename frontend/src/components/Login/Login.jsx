import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    navigate('/');
  };

  const handleCadastro = () => {
  navigate('/cadastro');
  };

  return (
    <div className="login-container">
      <img 
        src="pokeball-pc-hd 1.png" 
        alt="Pokeball background" 
        className="login-background"
      />
      
      <div className="login-card" ref={formRef}>
        <h1 className="login-title">Login</h1>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#666"/>
              </svg>
              <input 
                type="email" 
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            <div className="input-line"></div>
          </div>

          <div className="input-group">
            <label className="input-label">Senha</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="#666"/>
              </svg>
              <input 
                type="password" 
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Sua senha"
              />
            </div>
            <div className="input-line"></div>
          </div>

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <div className="cadastro-link">
          <span>Não tem um conta?</span>
          <span className="cadastro-text" onClick={handleCadastro}>Se cadastre!</span>
        </div>
      </div>
    </div>
  );
};

export default Login;