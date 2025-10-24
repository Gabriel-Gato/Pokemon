import React, { useState, useEffect } from 'react';
import './Pokedex.css';

const Pokedex = () => {
  const [pokemons, setPokemons] = useState([]);
  const [pokemonsWithImages, setPokemonsWithImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('official');

  useEffect(() => {
    fetchPokemons();
  }, []);


  const isValidImage = (url) => {
    return url && url !== 'null' && url !== 'undefined' && !url.includes('null');
  };


  const hasValidImage = (pokemon) => {
    return (
      isValidImage(pokemon.sprites.other?.['official-artwork']?.front_default) ||
      isValidImage(pokemon.sprites.other?.home?.front_default) ||
      isValidImage(pokemon.sprites.front_default)
    );
  };

  const fetchPokemons = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
      const data = await response.json();

      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          return res.json();
        })
      );


      const validPokemons = pokemonDetails.filter(hasValidImage);

      setPokemons(pokemonDetails);
      setPokemonsWithImages(validPokemons);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar Pokémon:', error);
      setLoading(false);
    }
  };

  const fetchPokemonDetails = async (pokemonId) => {
    try {
      setModalLoading(true);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      const data = await response.json();

      const speciesResponse = await fetch(data.species.url);
      const speciesData = await speciesResponse.json();

      const portugueseEntry = speciesData.flavor_text_entries.find(entry =>
        entry.language.name === 'pt'
      );
      const englishEntry = speciesData.flavor_text_entries.find(entry =>
        entry.language.name === 'en'
      );

      const pokemonWithDetails = {
        ...data,
        description: portugueseEntry?.flavor_text || englishEntry?.flavor_text || 'Descrição não disponível',
        habitat: speciesData.habitat?.name || 'Desconhecido',
        generation: speciesData.generation.name.replace('generation-', '').toUpperCase()
      };

      setSelectedPokemon(pokemonWithDetails);
      setModalLoading(false);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      setModalLoading(false);
    }
  };

  const handlePokemonClick = (pokemon) => {
    setSelectedImage('official');
    fetchPokemonDetails(pokemon.id);
  };

  const closeModal = () => {
    setSelectedPokemon(null);
    setModalLoading(false);
    setSelectedImage('official');
  };

  const handleImageSelect = (imageType) => {
    setSelectedImage(imageType);
  };

  const getMainImage = () => {
    if (!selectedPokemon) return '';

    const sprites = selectedPokemon.sprites;
    let imageUrl = '';

    switch(selectedImage) {
      case 'front':
        imageUrl = sprites.front_default;
        break;
      case 'back':
        imageUrl = sprites.back_default;
        break;
      case 'dream':
        imageUrl = sprites.other?.dream_world?.front_default;
        break;
      case 'shiny':
        imageUrl = sprites.front_shiny;
        break;
      case 'shiny-back':
        imageUrl = sprites.back_shiny;
        break;
      default:
        imageUrl = sprites.other?.['official-artwork']?.front_default ||
                   sprites.other?.home?.front_default;
        break;
    }


    if (!imageUrl) {
      imageUrl = sprites.front_default ||
                 sprites.other?.home?.front_default ||
                 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNTAgODBMMTUwIDgwTDE3MSAxMDFIMTUwVjE1MEgxMDBWMTIwSDgwTDEyMCA4MFoiIGZpbGw9IiNDRENEQ0QiLz4KPHBhdGggZD0iTTE1MCAyMjBMMTUwIDIyMEwxMjkgMTk5SDE1MFYxNTBIMjAwVjE4MEgyMjBMMTgwIDIyMFoiIGZpbGw9IiNDRENEQ0QiLz4KPHRleHQgeD0iMTUwIiB5PSIyNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiI+SW1hZ2VtIG7Do28gZGlzcG9uw612ZWw8L3RleHQ+Cjwvc3ZnPgo=';
    }

    return imageUrl;
  };

  const formatNumber = (num) => {
    return `#${num.toString().padStart(3, '0')}`;
  };

  const formatStatName = (stat) => {
    const statNames = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defesa',
      'special-attack': 'Ataque Especial',
      'special-defense': 'Defesa Especial',
      'speed': 'Velocidade'
    };
    return statNames[stat] || stat;
  };

  const filteredPokemons = pokemonsWithImages.filter(pokemon => {
    const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || pokemon.types.some(type => type.type.name === selectedType);
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="pokedex-loading">
        <div className="loading-pokeball"></div>
        <p>Carregando Pokémon...</p>
      </div>
    );
  }

  return (
    <div className="pokedex-container">
      <div className="pokedex-header">
        <h1>Pokédex</h1>
        <div className="pokedex-info">
          <span>Mostrando apenas Pokémon com imagens disponíveis</span>
        </div>
      </div>

      <div className="pokedex-filters">
        <div className="filter-group">
          <label htmlFor="search">Buscar Pokémon</label>
          <input
            id="search"
            type="text"
            placeholder="Digite o nome do Pokémon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${filteredPokemons.length === 0 && searchTerm ? 'no-results' : ''}`}
          />
        </div>

        <div className="filter-group">
          <label>Filtrar por Tipo</label>
          <div className="type-filter-buttons">
            <button
              className={`type-filter-btn all ${selectedType === '' ? 'active' : ''}`}
              onClick={() => setSelectedType('')}
            >
              Todos
            </button>

            <div className="type-row">
              {[
                { type: 'grass', name: 'Grama' },
                { type: 'fire', name: 'Fogo' },
                { type: 'water', name: 'Água' },
                { type: 'electric', name: 'Elétrico' },
                { type: 'psychic', name: 'Psíquico' }
              ].map(typeInfo => (
                <button
                  key={typeInfo.type}
                  className={`type-filter-btn ${typeInfo.type} ${selectedType === typeInfo.type ? 'active' : ''}`}
                  onClick={() => setSelectedType(typeInfo.type)}
                >
                  {typeInfo.name}
                </button>
              ))}
            </div>

            <div className="type-row">
              {[
                { type: 'ice', name: 'Gelo' },
                { type: 'dragon', name: 'Dragão' },
                { type: 'dark', name: 'Sombrio' },
                { type: 'fairy', name: 'Fada' },
                { type: 'normal', name: 'Normal' }
              ].map(typeInfo => (
                <button
                  key={typeInfo.type}
                  className={`type-filter-btn ${typeInfo.type} ${selectedType === typeInfo.type ? 'active' : ''}`}
                  onClick={() => setSelectedType(typeInfo.type)}
                >
                  {typeInfo.name}
                </button>
              ))}
            </div>

            <div className="type-row">
              {[
                { type: 'fighting', name: 'Lutador' },
                { type: 'poison', name: 'Veneno' },
                { type: 'ground', name: 'Terrestre' },
                { type: 'flying', name: 'Voador' }
              ].map(typeInfo => (
                <button
                  key={typeInfo.type}
                  className={`type-filter-btn ${typeInfo.type} ${selectedType === typeInfo.type ? 'active' : ''}`}
                  onClick={() => setSelectedType(typeInfo.type)}
                >
                  {typeInfo.name}
                </button>
              ))}
            </div>

            <div className="type-row">
              {[
                { type: 'bug', name: 'Inseto' },
                { type: 'rock', name: 'Pedra' },
                { type: 'ghost', name: 'Fantasma' },
                { type: 'steel', name: 'Metálico' }
              ].map(typeInfo => (
                <button
                  key={typeInfo.type}
                  className={`type-filter-btn ${typeInfo.type} ${selectedType === typeInfo.type ? 'active' : ''}`}
                  onClick={() => setSelectedType(typeInfo.type)}
                >
                  {typeInfo.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="results-counter">
        Mostrando <span>{filteredPokemons.length}</span> de <span>{pokemonsWithImages.length}</span> Pokémon
        {selectedType && ` - Filtrado por: ${selectedType}`}
        {searchTerm && ` - Buscando: "${searchTerm}"`}
      </div>

      <div className="pokemon-grid">
        {filteredPokemons.length > 0 ? (
          filteredPokemons.map(pokemon => (
            <div
              key={pokemon.id}
              className="pokemon-card"
              onClick={() => handlePokemonClick(pokemon)}
            >
              <div className="pokemon-number">
                {formatNumber(pokemon.id)}
              </div>
              <img
                src={pokemon.sprites.other?.['official-artwork']?.front_default ||
                     pokemon.sprites.other?.home?.front_default ||
                     pokemon.sprites.front_default}
                alt={pokemon.name}
                className="pokemon-image"
                onError={(e) => {
                  if (e.target.src !== pokemon.sprites.front_default) {
                    e.target.src = pokemon.sprites.front_default || '';
                  }
                }}
              />
              <h3 className="pokemon-name">{pokemon.name}</h3>
              <div className="pokemon-types">
                {pokemon.types.map(typeInfo => (
                  <span
                    key={typeInfo.type.name}
                    className={`type-badge type-${typeInfo.type.name}`}
                  >
                    {typeInfo.type.name}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results-message">
            <h3>Nenhum Pokémon encontrado</h3>
            <p>Tente ajustar sua busca ou filtro</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes - CORRIGIDO */}
      {selectedPokemon && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalLoading ? (
              <div className="modal-loading">
                <div className="loading-pokeball"></div>
                <p>Carregando detalhes...</p>
              </div>
            ) : (
              <>
                <button className="modal-close" onClick={closeModal}>×</button>

                <div className="modal-header">
                  <div className="modal-number">{formatNumber(selectedPokemon.id)}</div>
                  <h2 className="modal-name">{selectedPokemon.name}</h2>
                </div>

                <div className="modal-body">
                  <div className="modal-images">
                    <div className="main-image-container">
                      <img
                        src={getMainImage()}
                        alt={selectedPokemon.name}
                        className="modal-main-image"
                      />
                    </div>

                    <div className="image-selector">
                      {/* Arte Oficial */}
                      {(selectedPokemon.sprites.other?.['official-artwork']?.front_default ||
                        selectedPokemon.sprites.other?.home?.front_default) && (
                        <button
                          className={`image-option ${selectedImage === 'official' ? 'active' : ''}`}
                          onClick={() => handleImageSelect('official')}
                          title="Arte Oficial"
                        >
                          <img
                            src={selectedPokemon.sprites.other?.['official-artwork']?.front_default ||
                                 selectedPokemon.sprites.other?.home?.front_default}
                            alt="Oficial"
                          />
                        </button>
                      )}

                      {/* Sprite Frontal */}
                      {selectedPokemon.sprites.front_default && (
                        <button
                          className={`image-option ${selectedImage === 'front' ? 'active' : ''}`}
                          onClick={() => handleImageSelect('front')}
                          title="Frente"
                        >
                          <img
                            src={selectedPokemon.sprites.front_default}
                            alt="Frente"
                          />
                        </button>
                      )}

                      {/* Sprite Traseiro */}
                      {selectedPokemon.sprites.back_default && (
                        <button
                          className={`image-option ${selectedImage === 'back' ? 'active' : ''}`}
                          onClick={() => handleImageSelect('back')}
                          title="Costas"
                        >
                          <img
                            src={selectedPokemon.sprites.back_default}
                            alt="Costas"
                          />
                        </button>
                      )}

                      {/* Dream World */}
                      {selectedPokemon.sprites.other?.dream_world?.front_default && (
                        <button
                          className={`image-option ${selectedImage === 'dream' ? 'active' : ''}`}
                          onClick={() => handleImageSelect('dream')}
                          title="Dream World"
                        >
                          <img
                            src={selectedPokemon.sprites.other?.dream_world?.front_default}
                            alt="Dream World"
                          />
                        </button>
                      )}

                      {/* Shiny Frontal */}
                      {selectedPokemon.sprites.front_shiny && (
                        <button
                          className={`image-option ${selectedImage === 'shiny' ? 'active' : ''}`}
                          onClick={() => handleImageSelect('shiny')}
                          title="Shiny Frente"
                        >
                          <img
                            src={selectedPokemon.sprites.front_shiny}
                            alt="Shiny"
                          />
                        </button>
                      )}

                      {/* Shiny Traseiro */}
                      {selectedPokemon.sprites.back_shiny && (
                        <button
                          className={`image-option ${selectedImage === 'shiny-back' ? 'active' : ''}`}
                          onClick={() => handleImageSelect('shiny-back')}
                          title="Shiny Costas"
                        >
                          <img
                            src={selectedPokemon.sprites.back_shiny}
                            alt="Shiny Costas"
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="modal-details">
                    <div className="detail-section">
                      <h3>Tipos</h3>
                      <div className="modal-types">
                        {selectedPokemon.types.map(typeInfo => (
                          <span
                            key={typeInfo.type.name}
                            className={`type-badge type-${typeInfo.type.name}`}
                          >
                            {typeInfo.type.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>Estatísticas</h3>
                      <div className="stats-container">
                        {selectedPokemon.stats.map(stat => (
                          <div key={stat.stat.name} className="stat-bar">
                            <span className="stat-name">{formatStatName(stat.stat.name)}</span>
                            <div className="stat-bar-background">
                              <div
                                className="stat-bar-fill"
                                style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                              >
                                <span className="stat-value">{stat.base_stat}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>Informações</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Altura:</span>
                          <span className="info-value">{(selectedPokemon.height / 10).toFixed(1)} m</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Peso:</span>
                          <span className="info-value">{(selectedPokemon.weight / 10).toFixed(1)} kg</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Habilidades:</span>
                          <span className="info-value">
                            {selectedPokemon.abilities.map(ability => ability.ability.name).join(', ')}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Geração:</span>
                          <span className="info-value">{selectedPokemon.generation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>Descrição</h3>
                      <p className="pokemon-description">{selectedPokemon.description}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pokedex;