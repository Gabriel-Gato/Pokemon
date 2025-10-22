import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Buttons/Button';
import './Sections.css';

const WelcomeSection = () => {
  const navigate = useNavigate();

  return (
    <section className="section welcome-section">
      {/* Conteúdo principal que já temos */}
      <div className="welcome-content">
        <div className="text-content">
          <p className="welcome-text">
            Seja bem-vindo ao nosso site, um espaço dedicado inteiramente ao incrível mundo dos Pokémon!
            Aqui, você encontrará informações detalhadas sobre centenas de criaturas que marcaram gerações
            desde os clássicos da primeira geração até os mais recentes lançamentos.
          </p>
        </div>

        <div className="image-content">
          <img
            src="/fa00a1573843a45b25479e92d8dd1229ad329974.gif"
            alt="Pokémon"
            className="welcome-image"
          />
        </div>

        <div className="button-container">
          <Button
            text="Veja Mais"
            onClick={() => navigate('/pokedex')}
          />
        </div>
      </div>

      {/* LINHA DIVISÓRIA */}
      <div className="line-divider"></div>

      {/* SEÇÃO TCG DENTRO DA WELCOME */}
      <div className="tcg-subsection">
        <div className="tcg-text">
          <h2 className="tcg-title">Gosta de TCG?</h2>
          <p className="tcg-description">
            Seja bem-vindo ao nosso portal dedicado ao Pokémon Trading Card Game (TCG) o jogo de cartas
            colecionáveis que conquistou treinadores e colecionadores ao redor do mundo! Aqui, você
            encontrará tudo o que precisa para se aprofundar nesse universo estratégico e cheio de emoção.
            <br/><br/>
            Seja você um jogador buscando aprimorar suas estratégias ou um colecionador apaixonado atrás
            das cartas raras e edições especiais, este é o seu espaço para explorar, aprender e se conectar
            com a comunidade do Pokémon TCG.
          </p>
        </div>

        <div className="tcg-image">
          <img
            src="/eng_news_SV3pt5_183 1.png"
            alt="Cartas TCG"
            className="tcg-img"
          />
        </div>

        <div className="tcg-button">
          <Button
            text="Veja Mais"
            onClick={() => navigate('/tcg')}
          />
        </div>
      </div>

      <div className="line-divider"></div>

      {/* PARTE 3: SEÇÃO COMPETITIVO */}
      <div className="competitive-subsection">
        <div className="competitive-image">
          <img
            src="/C102-1 1.png"
            alt="Competitivo Pokémon"
            className="competitive-img"
          />
        </div>

        <div className="competitive-text">
          <h2 className="competitive-title">Jogador Do Competitivo?</h2>
          <p className="competitive-description">
            Aqui você encontrará um espaço dedicado ao emocionante mundo das batalhas estratégicas de Pokémon.
            O cenário competitivo reúne treinadores de todos os níveis que buscam testar suas habilidades,
            construir equipes equilibradas e participar de desafios em diversos formatos.
            <br/><br/>
            Prepare-se para explorar esse universo vibrante, cheio de desafios, aprendizado e muita emoção!
          </p>
        </div>

        <div className="competitive-button">
          <Button
            text="Veja Mais"
            onClick={() => navigate('/competitivo')}
          />
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;