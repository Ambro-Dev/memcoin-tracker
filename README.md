# Memcoin Tracker

Memcoin Tracker to zaawansowana aplikacja do śledzenia i analizy memcoinów, pomagająca zidentyfikować te z największym potencjałem sukcesu. Aplikacja integruje dane z różnych źródeł, w tym ceny z giełd kryptowalut, analizę sentymentu z mediów społecznościowych oraz metadane blockchain, aby dostarczyć kompleksowy obraz rynku memcoinów.

![Dashboard](./docs/images/dashboard-screenshot.png)

## 🚀 Funkcje

- **Dashboard analityczny** - Podgląd najważniejszych trendów i metryk memcoinów
- **Analiza prognoz** - Zaawansowany model predykcyjny oceniający szanse sukcesu memcoinów
- **Śledzenie cen** - Monitorowanie cen i zmian w czasie rzeczywistym
- **Analiza sentymentu** - Śledzenie nastrojów społeczności z Twittera/X i innych mediów społecznościowych
- **Zarządzanie portfolio** - Organizacja i śledzenie swoich zainteresowań inwestycyjnych
- **System alertów** - Powiadomienia o istotnych zmianach cen, wolumenu lub sentymentu
- **Szczegółowe analizy** - Wskaźniki techniczne, wykresy historyczne i analiza fundamentalna

## 🔧 Technologie

- **Next.js 14** - Framework React dla Front-end i Back-end
- **TypeScript** - Typowanie statyczne dla bezpieczniejszego kodu
- **Prisma** - ORM dla baz danych
- **PostgreSQL** - Baza danych
- **NextAuth.js** - Uwierzytelnianie i autoryzacja
- **Chart.js** - Wizualizacja danych
- **Tailwind CSS** - Stylizacja UI
- **n8n** - Automatyzacja procesów i integracja danych

## 📊 Jak to działa

### Model predykcyjny

Aplikacja wykorzystuje wieloczynnikowy model analizy do przewidywania potencjału wzrostu memcoinów, uwzględniając:

- **Analiza sentymentu społeczności (30%)** - Ocena nastrojów w mediach społecznościowych
- **Analiza techniczna (25%)** - Wskaźniki takie jak RSI, MACD, wolumen
- **Wzrost społeczności (20%)** - Tempo przyrostu członków społeczności
- **Płynność (15%)** - Poziom płynności na giełdach
- **Inne czynniki (10%)** - Wiek projektu, liczba giełd, kapitalizacja, aktywność deweloperska

### Automatyzacja

Przepływy pracy n8n automatyzują:
- Pobieranie i aktualizację danych o memcoinach (co godzinę)
- Analizę sentymentu społeczności (co 6 godzin)
- Aktualizację modelu predykcyjnego (co 12 godzin)
- Monitorowanie nagłych zmian cen i wolumenu (co 30 minut)

## 🚦 Rozpoczęcie pracy

### Wymagania wstępne

- Node.js (wersja 18 lub nowsza)
- PostgreSQL (wersja 12 lub nowsza)
- Docker (opcjonalnie, dla n8n)

### Instalacja

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/twoj-uzytkownik/memcoin-tracker.git
   cd memcoin-tracker
   ```

2. Zainstaluj zależności:
   ```bash
   npm install
   ```

3. Skonfiguruj zmienne środowiskowe:
   ```bash
   cp .env.example .env.local
   # Edytuj .env.local, aby dodać swoje klucze API i konfigurację bazy danych
   ```

4. Uruchom migracje bazy danych:
   ```bash
   npx prisma migrate dev
   ```

5. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

6. Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

### Konfiguracja n8n (opcjonalnie)

1. Uruchom n8n za pomocą Docker:
   ```bash
   docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
   ```

2. Otwórz [http://localhost:5678](http://localhost:5678) w przeglądarce.

3. Zaimportuj przepływy pracy z katalogu `/n8n-workflows`.

4. Skonfiguruj kredencjały dla CoinGecko i Twitter API.

## 📱 Przykładowe zrzuty ekranu

### Analiza memcoina
![Analiza memcoina](./docs/images/coin-analysis.png)

### Portfolio
![Portfolio](./docs/images/portfolio.png)

### Panel alertów
![Panel alertów](./docs/images/alerts.png)

## 🛠️ Wdrożenie

Zobacz [DEPLOYMENT.md](./docs/DEPLOYMENT.md) z instrukcjami dotyczącymi wdrażania aplikacji na różnych platformach.

## 🧪 Testowanie

```bash
# Uruchom testy jednostkowe
npm test

# Uruchom testy e2e
npm run test:e2e

# Sprawdź pokrycie testami
npm run test:coverage
```

## 🔐 Bezpieczeństwo

Zobacz [SECURITY.md](./docs/SECURITY.md) z informacjami o zabezpieczeniach i najlepszych praktykach.

## 🤝 Współpraca

Chcesz pomóc rozwijać projekt? Świetnie! Sprawdź [CONTRIBUTING.md](./docs/CONTRIBUTING.md), aby dowiedzieć się, jak możesz się zaangażować.

## 📝 Licencja

Ten projekt jest licencjonowany na warunkach licencji MIT - szczegóły w pliku [LICENSE](LICENSE).

## ⚠️ Zastrzeżenie

Memcoin Tracker jest narzędziem analitycznym i nie powinien być traktowany jako porada inwestycyjna. Zawsze przeprowadzaj własne badania przed podejmowaniem decyzji inwestycyjnych. Rynek kryptowalut, a zwłaszcza memcoinów, jest wysoce nieprzewidywalny i ryzykowny.

## 📞 Kontakt

Masz pytania lub sugestie? Skontaktuj się z nami pod adresem email@example.com lub otwórz problem w tym repozytorium.