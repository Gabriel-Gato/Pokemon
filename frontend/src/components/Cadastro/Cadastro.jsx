import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cadastro.css';

const Cadastro = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    usuario: '',
    confirmarSenha: '',
    politicaPrivacidade: false,
    termosUsuario: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpa o erro quando o usuário começa a digitar/marcar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validação dos campos obrigatórios
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';

    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    else if (formData.senha.length < 6) newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';

    if (!formData.usuario) newErrors.usuario = 'Usuário é obrigatório';

    if (!formData.confirmarSenha) newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    else if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = 'Senhas não coincidem';

    // Validação das checkboxes obrigatórias
    if (!formData.politicaPrivacidade) newErrors.politicaPrivacidade = 'Você deve aceitar as Políticas de Privacidade';
    if (!formData.termosUsuario) newErrors.termosUsuario = 'Você deve aceitar os Termos de Usuário';

    return newErrors;
  };

  const handleCadastro = (e) => {
    e.preventDefault();
    
    // Marca todos os campos como touched para mostrar erros
    const allTouched = {
      email: true,
      senha: true,
      usuario: true,
      confirmarSenha: true,
      politicaPrivacidade: true,
      termosUsuario: true
    };
    setTouched(allTouched);

    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Formulário válido - pode prosseguir com o cadastro
      console.log('Dados do cadastro:', formData);
      navigate('/login');
    } else {
      // Formulário inválido - mostra erros
      setErrors(newErrors);
      
      // Scroll para o primeiro erro
      const firstError = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstError}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="cadastro-container">
      <img 
        src="pokeball-pc-hd 1.png" 
        alt="Pokeball background" 
        className="cadastro-background"
      />
      
      <div className="cadastro-card" ref={formRef}>
        <h1 className="cadastro-title">Cadastro</h1>
        
        <form onSubmit={handleCadastro} className="cadastro-form">
          {/* Coluna Esquerda */}
          <div className="form-column left-column">
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#666"/>
                </svg>
                <input 
                  type="email" 
                  name="email"
                  className={`input-field ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="seu@email.com"
                />
              </div>
              <div className={`input-line ${errors.email ? 'error-line' : ''}`}></div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Senha</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="#666"/>
                </svg>
                <input 
                  type="password" 
                  name="senha"
                  className={`input-field ${errors.senha ? 'error' : ''}`}
                  value={formData.senha}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Sua senha"
                />
              </div>
              <div className={`input-line ${errors.senha ? 'error-line' : ''}`}></div>
              {errors.senha && <span className="error-message">{errors.senha}</span>}
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="form-column right-column">
            <div className="input-group">
              <label className="input-label">Usuário</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#666"/>
                </svg>
                <input 
                  type="text" 
                  name="usuario"
                  className={`input-field ${errors.usuario ? 'error' : ''}`}
                  value={formData.usuario}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Seu usuário"
                />
              </div>
              <div className={`input-line ${errors.usuario ? 'error-line' : ''}`}></div>
              {errors.usuario && <span className="error-message">{errors.usuario}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Confirme a senha</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="#666"/>
                </svg>
                <input 
                  type="password" 
                  name="confirmarSenha"
                  className={`input-field ${errors.confirmarSenha ? 'error' : ''}`}
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Confirme sua senha"
                />
              </div>
              <div className={`input-line ${errors.confirmarSenha ? 'error-line' : ''}`}></div>
              {errors.confirmarSenha && <span className="error-message">{errors.confirmarSenha}</span>}
            </div>
          </div>

          {/* Checkboxes Obrigatórias */}
          <div className="checkboxes-group">
            <div className="checkbox-item">
              <input 
                type="checkbox" 
                name="politicaPrivacidade"
                checked={formData.politicaPrivacidade}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`checkbox-input ${errors.politicaPrivacidade ? 'error-checkbox' : ''}`}
              />
              <span className="checkbox-text">
                Concordo com as <span className="checkbox-link">Politicas de Privacidade</span>
              </span>
              {errors.politicaPrivacidade && <span className="error-message checkbox-error">{errors.politicaPrivacidade}</span>}
            </div>

            <div className="checkbox-item">
              <input 
                type="checkbox" 
                name="termosUsuario"
                checked={formData.termosUsuario}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`checkbox-input ${errors.termosUsuario ? 'error-checkbox' : ''}`}
              />
              <span className="checkbox-text">
                Concordo com os <span className="checkbox-link">Termos de Usuario</span>
              </span>
              {errors.termosUsuario && <span className="error-message checkbox-error">{errors.termosUsuario}</span>}
            </div>
          </div>

          {/* Botão Centralizado */}
          <div className="button-container">
            <button type="submit" className="cadastro-button">
              Criar
            </button>
          </div>
        </form>

        <div className="login-link">
          <span>Já tem uma conta?</span>
          <span className="login-text" onClick={handleLogin}>Faça Login</span>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;