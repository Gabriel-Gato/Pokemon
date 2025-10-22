import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import localforage from "localforage";
import './TCG.css';

const PAGE_SIZE = 20;
const API_BASE_URL = 'http://localhost:8080/api/tcg';

// Configuração do localforage
localforage.config({
  name: "PokemonTCG",
  storeName: "cardsCache"
});

// ✅ Cache de imagens em memória
const imageCache = new Map();

// ✅ Pré-carregador de imagens
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    if (imageCache.has(src)) {
      resolve(imageCache.get(src));
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
};

// ✅ Função para verificar se uma carta tem imagem
const hasValidImage = (card) => {
  return card.images && (
    card.images.low ||
    card.images.small ||
    card.images.high ||
    card.images.large
  );
};

// ✅ Função de filtro otimizada
const filterCards = (cards, searchTerm) => {
  if (!searchTerm) return cards;

  const term = searchTerm.toLowerCase();
  return cards.filter(card =>
    card.name?.toLowerCase().includes(term)
  );
};

const TCG = () => {
  const [allCards, setAllCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [totalCards, setTotalCards] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loadedImages, setLoadedImages] = useState(new Set());

  // ✅ Debounce para o search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ Filtro OTIMIZADO - agora também filtra cartas sem imagem
  const filteredCards = useMemo(() => {
    const filtered = filterCards(allCards, debouncedSearchTerm);
    // ✅ Filtra cartas que não têm imagem válida
    return filtered.filter(card => hasValidImage(card));
  }, [allCards, debouncedSearchTerm]);

  // ✅ Atualiza cards visíveis
  useEffect(() => {
    const visibleCards = filteredCards.slice(0, page * PAGE_SIZE);
    setCards(visibleCards);
    setHasMore(visibleCards.length < filteredCards.length);
    setTotalCards(filteredCards.length);
  }, [filteredCards, page]);

  // ✅ Função para obter URL da imagem (SEMPRE low)
  const getImageUrl = useCallback((card) => {
    if (!hasValidImage(card)) return null;
    return card.images.low || card.images.small || card.images.high || card.images.large;
  }, []);

  // ✅ Função para obter URL da imagem do modal (TAMBÉM low)
  const getModalImageUrl = useCallback((card) => {
    if (!hasValidImage(card)) return null;
    return card.images.low || card.images.small || card.images.high || card.images.large;
  }, []);

  // ✅ Pré-carrega imagens das cartas visíveis (TODAS low)
  useEffect(() => {
    if (cards.length === 0) return;

    const imageUrls = cards
      .map(card => getImageUrl(card))
      .filter(Boolean); // ✅ Filtra URLs nulas

    imageUrls.forEach(src => {
      if (src && !loadedImages.has(src)) {
        preloadImage(src).catch(() => {});
      }
    });
  }, [cards, loadedImages, getImageUrl]);

  // ✅ Buscar TODAS as cartas - AGORA FILTRA CARTAS SEM IMAGEM
  const fetchAllCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Buscando cartas...');
      const response = await axios.get(`${API_BASE_URL}/all-cards`, {
        timeout: 30000
      });
      const responseData = response.data;

      if (responseData.data && responseData.data.length > 0) {
        console.log('✅ Cartas carregadas:', responseData.data.length);

        // ✅ Filtra cartas que não têm imagem válida
        const cardsWithImages = responseData.data
          .filter(card => {
            const hasImage = card.images && (
              card.images.small ||
              card.images.large ||
              card.images.high ||
              card.images.low
            );
            if (!hasImage) {
              console.log(`❌ Removendo carta sem imagem: ${card.name || card.id}`);
            }
            return hasImage;
          })
          .map(card => ({
            id: card.id,
            name: card.name || 'Unknown Pokémon',
            images: {
              small: card.images?.small,    // ✅ low quality (245x337)
              large: card.images?.large,    // ✅ high quality (600x825)
              high: card.images?.high,      // ✅ backup
              low: card.images?.low         // ✅ low quality (mais rápido)
            },
            rarity: card.rarity
          }));

        console.log(`✅ Cartas com imagem: ${cardsWithImages.length}`);

        setAllCards(cardsWithImages);

        // ✅ Pré-carrega IMEDIATAMENTE as primeiras 100 imagens LOW (são leves)
        setTimeout(() => {
          const firstBatchImages = cardsWithImages
            .slice(0, 100)
            .map(card => getImageUrl(card))
            .filter(Boolean); // ✅ Filtra URLs nulas

          firstBatchImages.forEach(src => {
            preloadImage(src).catch(() => {});
          });
        }, 0);

        await localforage.setItem('pokemon-cards-cache', {
          data: cardsWithImages,
          timestamp: Date.now()
        });

        console.log('💾 Cache atualizado');

      } else {
        throw new Error('Nenhuma carta encontrada');
      }

    } catch (err) {
      console.error('❌ Erro ao buscar cartas:', err);

      try {
        const cached = await localforage.getItem('pokemon-cards-cache');
        if (cached) {
          console.log('📦 Usando cache silenciosamente');
          // ✅ Filtra cartas sem imagem também no cache
          const cachedWithImages = cached.data.filter(card => hasValidImage(card));
          setAllCards(cachedWithImages);
          return;
        }
      } catch (cacheError) {
        console.warn('Erro ao ler cache:', cacheError);
      }

      let errorMessage = 'Erro ao carregar cartas';
      if (err.response) {
        errorMessage = `Erro ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Servidor não está respondendo';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [getImageUrl]);

  // ✅ Load more OTIMIZADO
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;

    setLoading(true);
    const nextPage = page + 1;

    setTimeout(() => {
      const nextCards = filteredCards.slice(0, nextPage * PAGE_SIZE);
      setCards(nextCards);
      setPage(nextPage);
      setHasMore(nextCards.length < filteredCards.length);
      setLoading(false);
    }, 50);
  }, [filteredCards, page, hasMore, loading]);

  // ✅ Intersection Observer para scroll infinito
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [loadMore, hasMore, loading]);

  // ✅ Handler de imagem SUPER OTIMIZADO
  const handleImageLoad = useCallback((e, src) => {
    e.target.style.opacity = '1';
    e.target.style.transition = 'opacity 0.05s ease-in';

    setLoadedImages(prev => new Set(prev).add(src));
  }, []);

  const handleImageError = useCallback((e, card) => {
    console.log(`❌ Erro na imagem da carta ${card.name}, removendo...`);

    // ✅ Remove a carta imediatamente se a imagem falhar
    setCards(prev => prev.filter(c => c.id !== card.id));
    setAllCards(prev => prev.filter(c => c.id !== card.id));
    setTotalCards(prev => prev - 1);
  }, []);

  // ✅ Modal functions
  const openCardModal = useCallback((card) => {
    if (!hasValidImage(card)) {
      console.log(`❌ Carta ${card.name} não tem imagem válida para modal`);
      return;
    }
    setSelectedCard(card);

    const modalImageUrl = getModalImageUrl(card);
    if (modalImageUrl && !imageCache.has(modalImageUrl)) {
      preloadImage(modalImageUrl).catch(() => {});
    }
  }, [getModalImageUrl]);

  const closeCardModal = useCallback(() => {
    setSelectedCard(null);
  }, []);

  // ✅ ESC key para fechar modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.keyCode === 27) closeCardModal();
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [closeCardModal]);

  // ✅ Limpar busca
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setPage(1);
  }, []);

  // ✅ Carregar dados iniciais
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchAllCards();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchAllCards]);

  return (
    <div className="tcg-container">
      <div className="tcg-header">
        <div className="tcg-title">
          <h1>Pokémon TCG</h1>
          <span className="image-info">
          </span>
        </div>
        <div className="tcg-stats">
          <span>📊 {totalCards} cartas</span>
          {initialLoad && <span className="loading-badge">Carregando...</span>}
        </div>
      </div>

      {error && allCards.length === 0 && (
        <div className="error-message">
          <strong>{error}</strong>
        </div>
      )}

      <div className="tcg-search">
        <div className="search-group">
          <input
            type="text"
            placeholder="🔍 Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search-btn">
              ❌
            </button>
          )}
        </div>
      </div>

      {initialLoad && !error && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          Carregando cartas...
        </div>
      )}

      {!initialLoad && cards.length === 0 && (
        <div className="no-cards-message">
          <h3>🎯 Nenhuma carta encontrada</h3>
          <p>
            {debouncedSearchTerm
              ? `Nenhuma carta encontrada para "${debouncedSearchTerm}"`
              : 'Nenhuma carta com imagem disponível'
            }
          </p>
        </div>
      )}

      {!initialLoad && cards.length > 0 && (
        <div className="cards-grid">
          {cards.map(card => {
            const imageUrl = getImageUrl(card);
            if (!imageUrl) return null; // ✅ Não renderiza se não tiver imagem

            return (
              <div
                key={card.id}
                className="card-item"
                onClick={() => openCardModal(card)}
              >
                <div className="card-image-container">
                  <img
                    src={imageUrl}
                    alt={card.name}
                    loading="eager"
                    className="card-image"
                    onLoad={(e) => handleImageLoad(e, imageUrl)}
                    onError={(e) => handleImageError(e, card)}
                  />
                  {!loadedImages.has(imageUrl) && (
                    <div className="image-loading">⚡</div>
                  )}
                </div>
                <div className="card-info">
                  {card.rarity && card.rarity !== 'Common' && (
                    <span className={`rarity-tag ${card.rarity.toLowerCase().includes('holo') ? 'holo' : ''}`}>
                      {card.rarity}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && <div id="scroll-sentinel" style={{ height: '1px' }}></div>}

      {loading && (
        <div className="loading-more">
          <div className="loading-spinner"></div>
          Carregando mais cartas...
        </div>
      )}

      {selectedCard && hasValidImage(selectedCard) && (
        <div className="modal-overlay" onClick={closeCardModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeCardModal}>
              ✕
            </button>
            <div className="modal-card-image">
              <img
                src={getModalImageUrl(selectedCard)}
                alt={selectedCard.name}
                className="modal-image"
              />
            </div>
            <div className="modal-card-info">
              <h3>{selectedCard.name}</h3>
              {selectedCard.rarity && selectedCard.rarity !== 'Common' && (
                <span className={`modal-rarity-tag ${selectedCard.rarity.toLowerCase().includes('holo') ? 'holo' : ''}`}>
                  {selectedCard.rarity}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TCG;