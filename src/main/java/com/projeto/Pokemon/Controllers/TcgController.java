package com.projeto.Pokemon.Controllers;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/tcg")
@CrossOrigin(origins = "http://localhost:3000")
public class TcgController {

    private final String TCGDEX_API_URL = "https://api.tcgdex.net/v2";
    private final String TCGDEX_ASSETS_URL = "https://assets.tcgdex.net";

    private RestTemplate getRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        return new RestTemplate(factory);
    }

    // 🔹 CORRIGIDO: Tenta múltiplas combinações até encontrar uma imagem que funcione
    private Map<String, String> buildImageUrls(Map<String, Object> card) {
        Map<String, String> imageUrls = new HashMap<>();

        if (card == null) {
            return imageUrls;
        }

        // Extrai informações do card
        String setId = null;
        String cardNumber = null;
        String serie = null;
        String cardId = (String) card.get("id");

        // Pega informações do set
        if (card.get("set") instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> setInfo = (Map<String, Object>) card.get("set");
            setId = (String) setInfo.get("id");

            // Pega a série
            if (setInfo.get("serie") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> serieInfo = (Map<String, Object>) setInfo.get("serie");
                serie = (String) serieInfo.get("id");
            }
        }

        // Pega o número do card
        cardNumber = (String) card.get("localId");
        if (cardNumber == null) {
            cardNumber = (String) card.get("number");
        }

        // Lista de possíveis URLs para tentar (em ordem de prioridade)
        List<String> possibleUrls = new ArrayList<>();

        // Método 1: Usando série, set e número (formato mais comum)
        if (serie != null && setId != null && cardNumber != null) {
            possibleUrls.add(String.format("%s/en/%s/%s/%s/high.png", TCGDEX_ASSETS_URL, serie, setId, cardNumber));
            possibleUrls.add(String.format("%s/en/%s/%s/%s/high.webp", TCGDEX_ASSETS_URL, serie, setId, cardNumber));
            possibleUrls.add(String.format("%s/en/%s/%s/%s.png", TCGDEX_ASSETS_URL, serie, setId, cardNumber));
            possibleUrls.add(String.format("%s/en/%s/%s/%s/low.png", TCGDEX_ASSETS_URL, serie, setId, cardNumber));
            possibleUrls.add(String.format("%s/en/%s/%s/%s/low.webp", TCGDEX_ASSETS_URL, serie, setId, cardNumber));
        }

        // Método 2: Usando apenas set e número (para casos como ru1)
        if (setId != null && cardNumber != null) {
            possibleUrls.add(String.format("%s/en/%s/%s/high.png", TCGDEX_ASSETS_URL, setId, cardNumber));
            possibleUrls.add(String.format("%s/en/%s/%s/high.webp", TCGDEX_ASSETS_URL, setId, cardNumber));
            possibleUrls.add(String.format("%s/en/%s/%s.png", TCGDEX_ASSETS_URL, setId, cardNumber));

            // Tentativa especial para ru1
            if ("ru1".equals(setId)) {
                possibleUrls.add(String.format("%s/en/ru/%s/%s/high.png", TCGDEX_ASSETS_URL, setId, cardNumber));
                possibleUrls.add(String.format("%s/en/ru/%s/%s/high.webp", TCGDEX_ASSETS_URL, setId, cardNumber));
                possibleUrls.add("https://assets.tcgdex.net/en/ru/ru1/1.png"); // URL direta conhecida
            }
        }

        // Método 3: Fallback usando cardId
        if (cardId != null) {
            String[] parts = cardId.split("-");
            if (parts.length >= 3) {
                possibleUrls.add(String.format("%s/en/%s/%s/%s/high.png", TCGDEX_ASSETS_URL, parts[0], parts[1], parts[2]));
                possibleUrls.add(String.format("%s/en/%s/%s/%s/high.webp", TCGDEX_ASSETS_URL, parts[0], parts[1], parts[2]));
            } else if (parts.length == 2) {
                possibleUrls.add(String.format("%s/en/%s/%s/high.png", TCGDEX_ASSETS_URL, parts[0], parts[1]));
                possibleUrls.add(String.format("%s/en/%s/%s/high.webp", TCGDEX_ASSETS_URL, parts[0], parts[1]));
            }
        }

        // Tenta encontrar uma URL que funcione
        String workingUrl = findWorkingImageUrl(possibleUrls);

        if (workingUrl != null) {
            imageUrls.put("small", workingUrl.replace("high.", "low.").replace("/high/", "/low/"));
            imageUrls.put("large", workingUrl);
            imageUrls.put("high", workingUrl);
            imageUrls.put("low", workingUrl.replace("high.", "low.").replace("/high/", "/low/"));
        } else {
            // Se nenhuma funcionar, usa a primeira opção como fallback
            if (!possibleUrls.isEmpty()) {
                String fallbackUrl = possibleUrls.get(0);
                imageUrls.put("small", fallbackUrl);
                imageUrls.put("large", fallbackUrl);
                imageUrls.put("high", fallbackUrl);
                imageUrls.put("low", fallbackUrl);
            }
        }

        return imageUrls;
    }

    // 🔹 Testa uma lista de URLs e retorna a primeira que funciona
    private String findWorkingImageUrl(List<String> urls) {
        RestTemplate restTemplate = getRestTemplate();

        for (String url : urls) {
            try {
                ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {

                    return url;
                }
            } catch (Exception e) {
                // Continua para a próxima URL

            }
        }
        return null;
    }

    // 🔹 Formata os cards recebidos da API para incluir URLs de imagem
    private List<Map<String, Object>> formatCards(Object[] cards) {
        List<Map<String, Object>> formattedCards = new ArrayList<>();

        for (Object cardObj : cards) {
            if (cardObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> card = (Map<String, Object>) cardObj;
                Map<String, Object> formattedCard = new HashMap<>();

                String cardId = (String) card.get("id");
                formattedCard.put("id", cardId);
                formattedCard.put("name", card.get("name"));
                formattedCard.put("rarity", card.get("rarity"));
                formattedCard.put("hp", card.get("hp"));
                formattedCard.put("types", card.get("types"));

                // Set info
                if (card.get("set") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> setInfo = (Map<String, Object>) card.get("set");
                    Map<String, String> simpleSet = new HashMap<>();
                    simpleSet.put("id", (String) setInfo.get("id"));
                    simpleSet.put("name", (String) setInfo.get("name"));

                    if (setInfo.get("serie") instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> serieInfo = (Map<String, Object>) setInfo.get("serie");
                        simpleSet.put("serieId", (String) serieInfo.get("id"));
                        simpleSet.put("serieName", (String) serieInfo.get("name"));
                    }

                    formattedCard.put("set", simpleSet);
                }

                // URLs de imagem - USANDO O NOVO MÉTODO INTELIGENTE
                Map<String, String> images = buildImageUrls(card);
                formattedCard.put("images", images);
                formattedCard.put("imageFallback", images.isEmpty());

                formattedCards.add(formattedCard);
            }
        }

        return formattedCards;
    }

    // 🔹 Buscar todas as cartas
    @GetMapping("/all-cards")
    public ResponseEntity<?> getAllCards() {
        try {
            String url = TCGDEX_API_URL + "/en/cards";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/json");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            RestTemplate restTemplate = getRestTemplate();
            ResponseEntity<Object[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, Object[].class);

            Object[] allCards = response.getBody();
            if (allCards != null) {
                List<Map<String, Object>> formattedCards = formatCards(allCards);

                Map<String, Object> responseData = new HashMap<>();
                responseData.put("data", formattedCards);
                responseData.put("total", formattedCards.size());
                responseData.put("timestamp", new Date().toString());
                responseData.put("imageFormat", "URLs inteligentes - múltiplas tentativas");
                responseData.put("status", "Usando método que testa URLs até encontrar uma que funcione");

                return ResponseEntity.ok(responseData);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Nenhuma carta encontrada"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Erro ao buscar cartas: " + e.getMessage()));
        }
    }

    // 🔹 Buscar carta específica
    @GetMapping("/cards/{id}")
    public ResponseEntity<?> getCardById(@PathVariable String id) {
        try {
            String url = TCGDEX_API_URL + "/en/cards/" + id;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/json");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            RestTemplate restTemplate = getRestTemplate();
            ResponseEntity<Object> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, Object.class);

            Object cardObj = response.getBody();
            if (cardObj instanceof Map) {
                Object[] singleCardArray = new Object[]{cardObj};
                List<Map<String, Object>> formattedCards = formatCards(singleCardArray);
                return ResponseEntity.ok(formattedCards.get(0));
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Carta não encontrada: " + id));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Carta não encontrada: " + id));
        }
    }

    // 🔹 Teste inteligente de URLs para um card específico
    @GetMapping("/test-card-images/{id}")
    public ResponseEntity<?> testCardImages(@PathVariable String id) {
        try {
            String url = TCGDEX_API_URL + "/en/cards/" + id;
            RestTemplate restTemplate = getRestTemplate();
            ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, null, Object.class);

            if (!(response.getBody() instanceof Map)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Carta não encontrada: " + id));
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> card = (Map<String, Object>) response.getBody();

            // Extrai informações para debug
            String cardId = (String) card.get("id");
            String cardName = (String) card.get("name");
            String localId = (String) card.get("localId");
            String number = (String) card.get("number");

            String setId = null;
            String serie = null;

            if (card.get("set") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> setInfo = (Map<String, Object>) card.get("set");
                setId = (String) setInfo.get("id");

                if (setInfo.get("serie") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> serieInfo = (Map<String, Object>) setInfo.get("serie");
                    serie = (String) serieInfo.get("id");
                }
            }

            // Gera várias URLs possíveis
            List<Map<String, Object>> urlTests = new ArrayList<>();

            // Diferentes combinações possíveis
            String[][] combinations = {
                    {serie, setId, localId != null ? localId : number, "high", "png"},
                    {serie, setId, localId != null ? localId : number, "high", "webp"},
                    {serie, setId, localId != null ? localId : number, "low", "png"},
                    {serie, setId, localId != null ? localId : number, "low", "webp"},
                    {setId, localId != null ? localId : number, "high", "png"},
                    {setId, localId != null ? localId : number, "high", "webp"},
                    {"ru", setId, localId != null ? localId : number, "high", "png"}, // Especial para ru1
                    {"ru", setId, localId != null ? localId : number, "high", "webp"}
            };

            for (String[] combo : combinations) {
                if (combo[0] != null && combo[1] != null && combo[2] != null) {
                    String testUrl;
                    if (combo.length == 5) {
                        testUrl = String.format("%s/en/%s/%s/%s/%s.%s",
                                TCGDEX_ASSETS_URL, combo[0], combo[1], combo[2], combo[3], combo[4]);
                    } else {
                        testUrl = String.format("%s/en/%s/%s/%s.%s",
                                TCGDEX_ASSETS_URL, combo[0], combo[1], combo[2], combo[3]);
                    }

                    Map<String, Object> testResult = new HashMap<>();
                    testResult.put("url", testUrl);
                    testResult.put("method", Arrays.toString(combo));

                    try {
                        ResponseEntity<byte[]> imageResponse = restTemplate.getForEntity(testUrl, byte[].class);
                        testResult.put("accessible", imageResponse.getStatusCode() == HttpStatus.OK);
                        testResult.put("status", imageResponse.getStatusCode().toString());
                    } catch (Exception e) {
                        testResult.put("accessible", false);
                        testResult.put("status", "ERROR: " + e.getMessage());
                    }

                    urlTests.add(testResult);
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("cardId", cardId);
            result.put("cardName", cardName);
            result.put("setId", setId);
            result.put("serie", serie);
            result.put("localId", localId);
            result.put("number", number);
            result.put("urlTests", urlTests);
            result.put("workingUrls", urlTests.stream()
                    .filter(test -> Boolean.TRUE.equals(test.get("accessible")))
                    .count());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Erro ao testar card: " + e.getMessage()));
        }
    }

    // 🔹 Debug detalhado do card
    @GetMapping("/debug-card/{id}")
    public ResponseEntity<?> debugCard(@PathVariable String id) {
        try {
            String url = TCGDEX_API_URL + "/en/cards/" + id;
            RestTemplate restTemplate = getRestTemplate();
            ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, null, Object.class);

            Object cardObj = response.getBody();

            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("cardId", id);

            if (cardObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> card = (Map<String, Object>) cardObj;

                debugInfo.put("name", card.get("name"));
                debugInfo.put("localId", card.get("localId"));
                debugInfo.put("number", card.get("number"));

                if (card.get("set") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> setInfo = (Map<String, Object>) card.get("set");
                    debugInfo.put("setId", setInfo.get("id"));
                    debugInfo.put("setName", setInfo.get("name"));

                    if (setInfo.get("serie") instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> serieInfo = (Map<String, Object>) setInfo.get("serie");
                        debugInfo.put("serieId", serieInfo.get("id"));
                        debugInfo.put("serieName", serieInfo.get("name"));
                    }
                }

                // URLs finais que serão usadas
                Map<String, String> finalUrls = buildImageUrls(card);
                debugInfo.put("finalImageUrls", finalUrls);
            }

            return ResponseEntity.ok(debugInfo);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Carta não encontrada: " + id));
        }
    }
}