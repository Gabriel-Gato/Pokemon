import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';
import { UserContext } from '../Navigation/UserContext';
import './Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useContext(UserContext);

  const [nome, setNome] = useState('');
  const [avatar, setAvatar] = useState('');
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);


  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setNome(user.nome || '');
    setAvatar(user.imagem || '');
  }, [user, navigate]);


  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagem', file);

    try {
      const res = await axios.post(
        `http://localhost:8080/api/login/upload/${user.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setAvatar(res.data.imagem);
      login(res.data);
    } catch (err) {
      console.error('Erro ao enviar imagem:', err);
    }
  };


  const handleSaveChanges = async () => {
    try {
      const body = { nome };
      const res = await axios.patch(
        `http://localhost:8080/api/login/email/${user.email}`,
        body
      );
      login(res.data);
      setOpenSaveModal(false);
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
    }
  };


  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/login/email/${user.email}`);
      logout();
      setOpenDeleteModal(false);
      navigate('/login');
    } catch (err) {
      console.error('Erro ao deletar conta:', err);
    }
  };


  const handleChangePasswordClick = () => {
    setOpenChangePasswordModal(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
  };


  const handleChangePassword = async () => {

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Todos os campos são obrigatórios');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');

    try {

      const response = await axios.post(
        `http://localhost:8080/api/login/verificar-senha/${user.email}`,
        { senha: passwordData.currentPassword }
      );

      const senhaCorreta = response.data;

      if (!senhaCorreta) {
        setPasswordError('Senha atual incorreta');
        setIsChangingPassword(false);
        return;
      }


      const body = { senha: passwordData.newPassword };
      const res = await axios.patch(
        `http://localhost:8080/api/login/email/${user.email}`,
        body
      );


      setOpenChangePasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordError('');
      setIsChangingPassword(false);

      alert('Senha alterada com sucesso!');

    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      setPasswordError('Erro ao alterar senha. Tente novamente.');
      setIsChangingPassword(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    if (passwordError) {
      setPasswordError('');
    }
  };

  if (!user) return null;

  return (
    <div className="LoginConfig">
      {/* Avatar com borda vermelha */}
      <label htmlFor="avatarInput">
        <img
          className="Ellipse3"
          src={avatar ? `http://localhost:8080/api/login/imagem/${avatar}` : "https://placehold.co/400x400"}
          alt="Avatar"
        />
      </label>
      <input
        type="file"
        id="avatarInput"
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleAvatarChange}
      />

      {/* Botão Alterar Senha - Laranja com ícone */}
      <div
        className="Rectangle13"
        onClick={handleChangePasswordClick}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M17 7.5V5.5C17 4.83696 16.7366 4.20107 16.2678 3.73223C15.7989 3.26339 15.163 3 14.5 3H9.5C8.83696 3 8.20107 3.26339 7.73223 3.73223C7.26339 4.20107 7 4.83696 7 5.5V7.5M5 9.5V18.5C5 19.163 5.26339 19.7989 5.73223 20.2678C6.20107 20.7366 6.83696 21 7.5 21H16.5C17.163 21 17.7989 20.7366 18.2678 20.2678C18.7366 19.7989 19 19.163 19 18.5V9.5C19 8.83696 18.7366 8.20107 18.2678 7.73223C17.7989 7.26339 17.163 7 16.5 7H7.5C6.83696 7 6.20107 7.26339 5.73223 7.73223C5.26339 8.20107 5 8.83696 5 9.5Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
        Alterar Senha
      </div>

      {/* Nome */}
      <div className="Nome">Nome</div>
      <input
        className="Verky"
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <div className="Line15"></div>

      {/* E-mail */}
      <div className="EMail">E-mail</div>
      <div className="GabrielhngatoGmailCom">{user.email}</div>
      <div className="Line16"></div>

      {/* Botões */}
      <div className="Rectangle11" onClick={() => setOpenSaveModal(true)}>
        Salvar
      </div>
      <div className="Rectangle12" onClick={() => setOpenDeleteModal(true)}>
        Apagar Conta
      </div>

      {/* Modal Alterar Senha */}
      {openChangePasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Alterar Senha</h2>
              <button
                className="close-button"
                onClick={() => setOpenChangePasswordModal(false)}
                disabled={isChangingPassword}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {passwordError && (
                <div className="error-message">
                  {passwordError}
                </div>
              )}

              <div className="password-input-group">
                <label>Senha Atual</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                  placeholder="Digite sua senha atual"
                  disabled={isChangingPassword}
                />
              </div>

              <div className="password-input-group">
                <label>Nova Senha</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                  disabled={isChangingPassword}
                />
              </div>

              <div className="password-input-group">
                <label>Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirme a nova senha"
                  disabled={isChangingPassword}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setOpenChangePasswordModal(false)}
                disabled={isChangingPassword}
              >
                Cancelar
              </button>
              <button
                className="confirm-button"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais existentes */}
      <ConfirmModal
        isOpen={openSaveModal}
        onClose={() => setOpenSaveModal(false)}
        onConfirm={handleSaveChanges}
        title="Salvar alterações?"
        message="Tem certeza que deseja salvar as alterações feitas no seu perfil?"
      />

      <ConfirmModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Deletar conta?"
        message="Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default Perfil;