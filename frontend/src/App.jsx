import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header';
import Login from './components/Login/Login';
import Cadastro from './components/Cadastro/Cadastro';
import WelcomeSection from './components/Sections/WelcomeSection';
import Pokedex from './components/Pokedex/Pokedex'
import TCG from './components/TCG/TCG';
import Competitivo from './components/Competitivo/Competitivo';

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={
          <main className="main">
            <section id="login-section">
            <WelcomeSection />
            </section>
          </main>
        } />
     
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/pokedex" element={<Pokedex />} />
        <Route path='/tcg' element={<TCG/>} />
        <Route path='/competitivo' element={<Competitivo/>} />
      </Routes>
    </div>
  );
}

export default App;