import React, { useState, useEffect, useCallback } from 'react';
import './Competitivo.css';

const Competitive = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [selectedTier, setSelectedTier] = useState('all');
  const [team, setTeam] = useState([]);
  const [teamAnalysis, setTeamAnalysis] = useState(null);
  const [view, setView] = useState('tier-list');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', pokemonName: '', type: 'success' });


  useEffect(() => {

    document.body.classList.add('competitive-body');
    

    return () => {
      document.body.classList.remove('competitive-body');
    };
  }, []);


  const tiers = [
    { id: 'all', name: 'Todos Pokémon', description: 'Todos os 1000+ Pokémon' },
    { id: 'uber', name: 'Uber', description: 'Lendários e muito fortes' },
    { id: 'ou', name: 'OverUsed', description: 'Meta principal' },
    { id: 'uu', name: 'UnderUsed', description: 'Tier secundário' },
    { id: 'ru', name: 'RarelyUsed', description: 'Tier terciário' },
    { id: 'nu', name: 'NeverUsed', description: 'Pokémon de nicho' },
    { id: 'pu', name: 'PU', description: 'Raramente usados' },
    { id: 'lc', name: 'Little Cup', description: 'Pokémon básicos' }
  ];


  const fetchAllPokemon = async () => {
    try {
      setLoading(true);
      

      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
      const data = await response.json();
      

      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon) => {
          try {
            const res = await fetch(pokemon.url);
            const details = await res.json();
            

            const sprite = 
              details.sprites.other?.['official-artwork']?.front_default ||
              details.sprites.front_default ||
              details.sprites.front_shiny ||
              details.sprites.back_default;
            

            if (!sprite) {
              return null;
            }
            

            const competitiveData = generateCompetitiveData(details);
            
            return {
              id: details.id,
              name: details.name,
              ...competitiveData,
              sprite: sprite,
              types: details.types.map(t => t.type.name),
              stats: details.stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
              }, {})
            };
          } catch (error) {
            console.error(`Erro ao buscar ${pokemon.name}:`, error);
            return null;
          }
        })
      );
      

      const validPokemon = pokemonDetails.filter(pokemon => pokemon !== null);
      

      const sortedByUsage = validPokemon.sort((a, b) => b.usage - a.usage);
      
      setPokemons(sortedByUsage);
      setLoading(false);
      
      console.log(`🎯 Carregados ${sortedByUsage.length} Pokémon ordenados por uso!`);
      
    } catch (error) {
      console.error('Erro ao buscar Pokémon:', error);
      setLoading(false);
    }
  };


  const generateCompetitiveData = (pokemon) => {
    const stats = pokemon.stats.reduce((acc, stat) => {
      acc[stat.stat.name] = stat.base_stat;
      return acc;
    }, {});

    const totalBST = Object.values(stats).reduce((a, b) => a + b, 0);
    

    let tier = 'nu';
    let usage = 0;
    
    if (totalBST >= 670) {
      tier = 'uber';
      usage = Math.random() * 15 + 20; // 20-35%
    } else if (totalBST >= 580) {
      tier = 'ou';
      usage = Math.random() * 12 + 12; // 12-24%
    } else if (totalBST >= 520) {
      tier = 'uu';
      usage = Math.random() * 10 + 8; // 8-18%
    } else if (totalBST >= 480) {
      tier = 'ru';
      usage = Math.random() * 8 + 4; // 4-12%
    } else if (totalBST >= 430) {
      tier = 'nu';
      usage = Math.random() * 6 + 2; // 2-8%
    } else {
      tier = 'pu';
      usage = Math.random() * 4 + 1; // 1-5%
    }


    if (['mewtwo', 'kyogre', 'groudon', 'rayquaza', 'arceus'].includes(pokemon.name)) {
      tier = 'uber';
      usage = 25 + Math.random() * 10;
    } else if (['charizard', 'blastoise', 'venusaur', 'pikachu', 'lucario', 'garchomp', 'tyranitar', 'salamence', 'metagross', 'dragonite', 'gengar', 'machamp', 'alakazam'].includes(pokemon.name)) {
      tier = 'ou';
      usage = 15 + Math.random() * 8;
    }


    const movesets = generateMovesets(pokemon);
    const { counters, checks } = generateCounters(pokemon);

    return {
      usage: parseFloat(usage.toFixed(1)),
      tier,
      movesets,
      counters,
      checks
    };
  };


  const generateMovesets = (pokemon) => {
    const types = pokemon.types.map(t => t.type.name);
    const stats = pokemon.stats.reduce((acc, stat) => {
      acc[stat.stat.name] = stat.base_stat;
      return acc;
    }, {});

    const isPhysical = stats.attack > stats['special-attack'];
    const isDefensive = stats.hp + stats.defense + stats['special-defense'] > 200;

    const typeMoves = {
      fire: ['Flamethrower', 'Fire Blast', 'Overheat', 'Flare Blitz'],
      water: ['Hydro Pump', 'Surf', 'Scald', 'Liquidation'],
      grass: ['Energy Ball', 'Leaf Storm', 'Giga Drain', 'Power Whip'],
      electric: ['Thunderbolt', 'Volt Switch', 'Thunder', 'Wild Charge'],
      psychic: ['Psychic', 'Psyshock', 'Future Sight', 'Zen Headbutt'],
      dark: ['Dark Pulse', 'Knock Off', 'Sucker Punch', 'Foul Play'],
      dragon: ['Draco Meteor', 'Dragon Pulse', 'Outrage', 'Dragon Claw'],
      fairy: ['Moonblast', 'Dazzling Gleam', 'Play Rough', 'Fleur Cannon'],
      fighting: ['Close Combat', 'Drain Punch', 'High Jump Kick', 'Mach Punch'],
      ground: ['Earthquake', 'Earth Power', 'High Horsepower', 'Bulldoze'],
      flying: ['Brave Bird', 'Hurricane', 'Air Slash', 'Dual Wingbeat'],
      steel: ['Iron Head', 'Flash Cannon', 'Meteor Mash', 'Bullet Punch'],
      poison: ['Sludge Bomb', 'Gunk Shot', 'Poison Jab', 'Toxic'],
      bug: ['U-turn', 'Bug Buzz', 'Leech Life', 'X-Scissor'],
      rock: ['Stone Edge', 'Rock Slide', 'Power Gem', 'Head Smash'],
      ghost: ['Shadow Ball', 'Shadow Claw', 'Hex', 'Phantom Force'],
      ice: ['Ice Beam', 'Blizzard', 'Ice Punch', 'Icicle Crash'],
      normal: ['Return', 'Hyper Voice', 'Body Slam', 'Double-Edge']
    };

    const utilityMoves = ['Protect', 'Substitute', 'Toxic', 'Will-O-Wisp', 'Thunder Wave', 'Stealth Rock', 'Defog', 'Roost', 'Recover'];

    const movesets = [];
    

    const offensiveMoves = types.flatMap(type => typeMoves[type] || []).slice(0, 3);
    if (offensiveMoves.length >= 2) {
      movesets.push({
        name: isPhysical ? 'Physical Attacker' : 'Special Attacker',
        moves: [...offensiveMoves, 'Protect'].slice(0, 4),
        item: isPhysical ? 'Choice Band' : 'Choice Specs',
        ability: getAbility(pokemon),
        nature: isPhysical ? 'Adamant' : 'Modest',
        evs: { hp: 0, atk: isPhysical ? 252 : 0, def: 0, spa: isPhysical ? 0 : 252, spd: 4, spe: 252 }
      });
    }


    if (isDefensive) {
      movesets.push({
        name: 'Defensive Wall',
        moves: [types[0] ? (typeMoves[types[0]] || [])[0] : 'Tackle', ...utilityMoves.slice(0, 3)].slice(0, 4),
        item: 'Leftovers',
        ability: getAbility(pokemon),
        nature: 'Bold',
        evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 }
      });
    }

    return movesets.length > 0 ? movesets : [{
      name: 'Balanced',
      moves: ['Tackle', 'Protect', 'Substitute', 'Toxic'].slice(0, 4),
      item: 'Leftovers',
      ability: getAbility(pokemon),
      nature: 'Serious',
      evs: { hp: 252, atk: 0, def: 128, spa: 0, spd: 128, spe: 0 }
    }];
  };

  const getAbility = (pokemon) => {
    return pokemon.abilities.find(a => !a.is_hidden)?.ability?.name || 'Overgrow';
  };


  const generateCounters = (pokemon) => {
    const types = pokemon.types.map(t => t.type.name);
    

    const superEffectiveTypes = getSuperEffectiveTypes(types);
    

    const commonCounters = getCommonPokemonByTypes(superEffectiveTypes).slice(0, 3);
    const commonChecks = getCommonPokemonByTypes(superEffectiveTypes).slice(3, 6);

    return {
      counters: commonCounters,
      checks: commonChecks
    };
  };

  const getSuperEffectiveTypes = (types) => {
    const typeChart = {
      normal: ['fighting'],
      fire: ['water', 'ground', 'rock'],
      water: ['electric', 'grass'],
      electric: ['ground'],
      grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
      ice: ['fire', 'fighting', 'rock', 'steel'],
      fighting: ['flying', 'psychic', 'fairy'],
      poison: ['ground', 'psychic'],
      ground: ['water', 'grass', 'ice'],
      flying: ['electric', 'ice', 'rock'],
      psychic: ['bug', 'ghost', 'dark'],
      bug: ['fire', 'flying', 'rock'],
      rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
      ghost: ['ghost', 'dark'],
      dragon: ['ice', 'dragon', 'fairy'],
      dark: ['fighting', 'bug', 'fairy'],
      steel: ['fire', 'fighting', 'ground'],
      fairy: ['poison', 'steel']
    };

    return [...new Set(types.flatMap(type => typeChart[type] || []))];
  };

  const getCommonPokemonByTypes = (types) => {
    const commonPokemon = {
      water: ['Blastoise', 'Gyarados', 'Swampert', 'Milotic'],
      fire: ['Charizard', 'Arcanine', 'Infernape', 'Volcarona'],
      grass: ['Venusaur', 'Breloom', 'Ferrothorn', 'Kartana'],
      electric: ['Pikachu', 'Jolteon', 'Ampharos', 'Zapdos'],
      psychic: ['Alakazam', 'Gardevoir', 'Metagross', 'Latios'],
      dark: ['Tyranitar', 'Weavile', 'Hydreigon', 'Greninja'],
      dragon: ['Dragonite', 'Salamence', 'Garchomp', 'Kommo-o'],
      fairy: ['Clefable', 'Togekiss', 'Sylveon', 'Tapu Koko'],
      fighting: ['Machamp', 'Lucario', 'Conkeldurr', 'Marshadow'],
      ground: ['Garchomp', 'Excadrill', 'Landorus', 'Mamoswine'],
      flying: ['Skarmory', 'Salamence', 'Corviknight', 'Tornadus'],
      steel: ['Metagross', 'Scizor', 'Heatran', 'Aegislash'],
      poison: ['Nidoking', 'Crobat', 'Toxapex', 'Salazzle'],
      bug: ['Scizor', 'Volcarona', 'Heracross', 'Buzzwole'],
      rock: ['Tyranitar', 'Aerodactyl', 'Rhyperior', 'Lycanroc'],
      ghost: ['Gengar', 'Mimikyu', 'Aegislash', 'Dragapult'],
      ice: ['Lapras', 'Weavile', 'Mamoswine', 'Kyurem'],
      normal: ['Snorlax', 'Blissey', 'Porygon2', 'Indeedee']
    };

    return [...new Set(types.flatMap(type => commonPokemon[type] || []))];
  };


  const filteredPokemons = pokemons.filter(pokemon => {
    const matchesTier = selectedTier === 'all' || pokemon.tier === selectedTier;
    const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const addToTeam = (pokemon) => {
    if (team.length >= 6) {
      showNotification(`Time cheio! Máximo 6 Pokémon.`, pokemon.name, 'error');
      return;
    }
    
    if (team.find(p => p.id === pokemon.id)) {
      showNotification(`${pokemon.name} já está no time!`, pokemon.name, 'warning');
      return;
    }
    
    setTeam([...team, { ...pokemon, teamRole: getSuggestedRole(pokemon) }]);
    showNotification(`${pokemon.name} adicionado ao time!`, pokemon.name, 'success');
  };

  const showNotification = (message, pokemonName, type = 'success') => {
    setNotification({
      show: true,
      message: message,
      pokemonName: pokemonName,
      type: type
    });
    
    setTimeout(() => {
      setNotification({ show: false, message: '', pokemonName: '', type: 'success' });
    }, 3000);
  };

  const removeFromTeam = (pokemonId) => {
    setTeam(team.filter(p => p.id !== pokemonId));
  };

  const getSuggestedRole = (pokemon) => {
    const stats = pokemon.stats;
    const totalDefensive = stats.hp + stats.defense + stats['special-defense'];
    const totalOffensive = Math.max(stats.attack, stats['special-attack']);
    
    if (totalDefensive > 300) return 'Defensive Wall';
    if (totalOffensive > 120) return 'Sweeper';
    if (stats.speed > 100) return 'Revenge Killer';
    return 'Utility';
  };

  const analyzeTeam = () => {
    const types = team.flatMap(p => p.types);
    const typeCount = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    setTeamAnalysis({
      typeCoverage: Object.keys(typeCount),
      teamSize: team.length,
      suggestions: generateTeamSuggestions(team)
    });
  };

  const generateTeamSuggestions = (team) => {
    const suggestions = [];
    
    if (team.length < 6) {
      suggestions.push(`Time incompleto (${team.length}/6). Adicione mais Pokémon.`);
    }
    
    const types = team.flatMap(p => p.types);
    const typeCount = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});


    const missingTypes = ['water', 'fire', 'grass', 'electric'].filter(type => !typeCount[type]);
    if (missingTypes.length > 0) {
      suggestions.push(`Falta cobertura para os tipos: ${missingTypes.join(', ')}`);
    }

    return suggestions.length > 0 ? suggestions : ['Time bem equilibrado! Boa cobertura de tipos.'];
  };

  const clearTeam = () => {
    setTeam([]);
    setTeamAnalysis(null);
  };

  useEffect(() => {
    fetchAllPokemon();
  }, []);

  const handleTierChange = (tier) => {
    setSelectedTier(tier);
  };

  const handlePokemonSelect = (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  if (loading) {
    return (
      <div className="competitive-loading">
        <div className="loading-stats"></div>
        <p>Carregando todos os Pokémon competitivos...</p>
      </div>
    );
  }

  return (
    <div className="competitive-container">
      {/* Notificação */}
      {notification.show && (
        <div className={`team-notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' && '✅'}
              {notification.type === 'error' && '❌'}
              {notification.type === 'warning' && '⚠️'}
            </span>
            <div className="notification-text">
              <strong>{notification.pokemonName}</strong>
              <span>{notification.message}</span>
            </div>
            <button 
              className="notification-close"
              onClick={() => setNotification({ show: false, message: '', pokemonName: '', type: 'success' })}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="competitive-header">
        <h1>🏆 Competitive Dex</h1>
        <p>Dados competitivos para todos os {pokemons.length} Pokémon</p>
      </div>

      {/* Navegação */}
      <div className="competitive-nav">
        <button className={`nav-btn ${view === 'tier-list' ? 'active' : ''}`} onClick={() => setView('tier-list')}>
          📊 Todos Pokémon
        </button>
        <button className={`nav-btn ${view === 'team-builder' ? 'active' : ''}`} onClick={() => setView('team-builder')}>
          🛠️ Team Builder
        </button>
      </div>

      {/* Filtros */}
      <div className="competitive-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar Pokémon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select value={selectedTier} onChange={(e) => handleTierChange(e.target.value)}>
            {tiers.map(tier => (
              <option key={tier.id} value={tier.id}>{tier.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tier List */}
      {view === 'tier-list' && (
        <div className="tier-list-view">
          <div className="results-info">
            Mostrando {filteredPokemons.length} de {pokemons.length} Pokémon
          </div>

          <div className="pokemon-grid">
            {filteredPokemons.map(pokemon => (
              <div 
                key={pokemon.id} 
                className="pokemon-card competitive-card"
                onClick={() => handlePokemonSelect(pokemon)}
              >
                <div className="pokemon-header">
                  <h3 className="pokemon-name">#{pokemon.id} {pokemon.name}</h3>
                  <span className="usage-rate">{pokemon.usage}%</span>
                </div>
                
                <img src={pokemon.sprite} alt={pokemon.name} className="pokemon-sprite" />
                
                <div className="pokemon-types">
                  {pokemon.types.map(type => (
                    <span key={type} className={`type-badge type-${type.toLowerCase()}`}>
                      {type}
                    </span>
                  ))}
                </div>
                
                <div className="competitive-info">
                  <div className={`tier-badge tier-${pokemon.tier}`}>
                    {pokemon.tier.toUpperCase()}
                  </div>
                  <button 
                    className="add-to-team-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToTeam(pokemon);
                    }}
                  >
                    ➕ Time
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Builder */}
      {view === 'team-builder' && (
        <div className="team-builder-view">
          <div className="team-header">
            <h3>Seu Time ({team.length}/6)</h3>
            <div className="team-actions">
              <button onClick={analyzeTeam} className="analyze-btn" disabled={team.length === 0}>
                🔍 Analisar Time
              </button>
              <button onClick={clearTeam} className="clear-btn">
                🗑️ Limpar
              </button>
            </div>
          </div>

          <div className="team-display">
            {team.map(pokemon => (
              <div key={pokemon.id} className="team-slot">
                <div className="team-pokemon">
                  <img src={pokemon.sprite} alt={pokemon.name} className="team-sprite" />
                  <h4>{pokemon.name}</h4>
                  <div className="team-types">
                    {pokemon.types.map(type => (
                      <span key={type} className={`type-badge type-${type.toLowerCase()}`}>
                        {type}
                      </span>
                    ))}
                  </div>
                  <span className="team-role">{pokemon.teamRole}</span>
                  <button onClick={() => removeFromTeam(pokemon.id)} className="remove-btn">
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {Array.from({ length: 6 - team.length }).map((_, index) => (
              <div key={index} className="team-slot empty">
                <span>Slot {index + 1}</span>
              </div>
            ))}
          </div>

          {teamAnalysis && (
            <div className="team-analysis">
              <h4>📈 Análise do Time</h4>
              <div className="analysis-grid">
                <div className="analysis-item">
                  <strong>Tamanho do Time:</strong>
                  <span>{teamAnalysis.teamSize}/6 Pokémon</span>
                </div>
                <div className="analysis-item">
                  <strong>Cobertura de Tipos:</strong>
                  <div className="type-coverage">
                    {teamAnalysis.typeCoverage.map(type => (
                      <span key={type} className={`type-badge type-${type.toLowerCase()}`}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="analysis-item full-width">
                  <strong>Sugestões:</strong>
                  <ul>
                    {teamAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedPokemon && (
        <div className="modal-overlay" onClick={() => setSelectedPokemon(null)}>
          <div className="modal-content competitive-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPokemon(null)}>×</button>
            
            <div className="competitive-modal-header">
              <img src={selectedPokemon.sprite} alt={selectedPokemon.name} className="modal-sprite" />
              <div className="modal-title">
                <h2>#{selectedPokemon.id} {selectedPokemon.name}</h2>
                <div className="modal-types">
                  {selectedPokemon.types.map(type => (
                    <span key={type} className={`type-badge type-${type.toLowerCase()}`}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <span className="usage-badge">{selectedPokemon.usage}% usage</span>
            </div>

            <div className="competitive-modal-body">
              {/* Estatísticas - Melhor Visualização */}
              <div className="stats-section">
                <h3>📊 Estatísticas Base</h3>
                <div className="stats-grid-improved">
                  {Object.entries(selectedPokemon.stats).map(([stat, value]) => {
                    const statNames = {
                      'hp': 'HP',
                      'attack': 'Ataque',
                      'defense': 'Defesa',
                      'special-attack': 'Ataque Esp.',
                      'special-defense': 'Defesa Esp.',
                      'speed': 'Velocidade'
                    };
                    
                    const percentage = (value / 255) * 100;
                    let barColor = '#4CAF50'; // Verde para altos valores
                    if (value < 50) barColor = '#f44336'; // Vermelho para baixos valores
                    else if (value < 80) barColor = '#FF9800'; // Laranja para médios valores
                    
                    return (
                      <div key={stat} className="stat-item-improved">
                        <div className="stat-header">
                          <span className="stat-name-improved">{statNames[stat] || stat}</span>
                          <span className="stat-value-improved">{value}</span>
                        </div>
                        <div className="stat-bar-improved">
                          <div 
                            className="stat-bar-fill-improved"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: barColor
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Movesets - Com Espaço */}
              <div className="movesets-section">
                <h3>⚔️ Sets Competitivos</h3>
                <div className="movesets-container">
                  {selectedPokemon.movesets.map((set, index) => (
                    <div key={index} className="moveset-improved">
                      <h4 className="moveset-title">{set.name}</h4>
                      <div className="moveset-content">
                        <div className="moves-section">
                          <strong className="moves-label">Movimentos:</strong>
                          <div className="move-list-improved">
                            {set.moves.map((move, moveIndex) => (
                              <span key={moveIndex} className="move-badge-improved">
                                {move}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="moveset-details-improved">
                          <div className="detail-item">
                            <span className="detail-label">Item:</span>
                            <span className="detail-value">{set.item}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Habilidade:</span>
                            <span className="detail-value">{set.ability}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Nature:</span>
                            <span className="detail-value">{set.nature}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">EVs:</span>
                            <span className="detail-value">
                              {Object.entries(set.evs)
                                .filter(([_, val]) => val > 0)
                                .map(([stat, val]) => `${val} ${stat}`)
                                .join(' / ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counters e Checks - Com Espaço */}
              <div className="counters-section-improved">
                <div className="counters-checks-container">
                  <div className="counters-container">
                    <h3>🛡️ Counters</h3>
                    <div className="counter-list-improved">
                      {selectedPokemon.counters.map((counter, index) => (
                        <span key={index} className="counter-badge-improved">
                          {counter}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="checks-container">
                    <h3>⚡ Checks</h3>
                    <div className="check-list-improved">
                      {selectedPokemon.checks.map((check, index) => (
                        <span key={index} className="check-badge-improved">
                          {check}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Competitive;