import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const storedEmail = localStorage.getItem('usuarioEmail');
    if (storedEmail) {
      axios.get(`http://localhost:8080/api/login/email/${storedEmail}`)
        .then(res => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('usuarioEmail', userData.email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuarioEmail');
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
