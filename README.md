**HabitTracker - Aplikacja do Śledzenia Nawyków**
**Opis projektu**
HabitTracker to aplikacja webowa do śledzenia i budowania codziennych nawyków. Składa się z backendu w Node.js/Express i frontendu w Vue.js 3.

**Funkcjonalności**
- Rejestracja i logowanie użytkowników z JWT

- Tworzenie, edycja i usuwanie nawyków

- Śledzenie postępów (system streak)

- Dashboard z statystykami

- Responsywny interfejs

**Technologie**
Backend:
Node.js, Express.js

JWT (JSON Web Tokens)

In-memory database (development)

Frontend:
Vue.js 3, Vue Router, Vuex

Vite, Axios

CSS3, Responsive Design

**Instalacja**
1. Klonowanie repozytorium

git clone https://github.com/twojanazwa/HabitTracker.git
cd HabitTracker
2. Backend

cd backend
npm install
Utwórz plik .env:


PORT=5001
JWT_SECRET=twoj_tajny_klucz
NODE_ENV=development
3. Frontend

cd ../frontend
npm install
Uruchomienie
Terminal 1 - Backend:

cd backend
npm start
Terminal 2 - Frontend:

cd frontend
npm run dev
**Adresy**
Frontend: http://localhost:5173

Backend: http://localhost:5001

API Health: http://localhost:5001/api/health

**Dane testowe**
Aplikacja automatycznie tworzy testowego użytkownika:

Email: test@example.com

Hasło: password123

Username: testuser

**Struktura projektu**

HabitTracker/

├── backend/

│   ├── src/

│   │   ├── controllers/   # Logika biznesowa

│   │   ├── middleware/    # Autoryzacja JWT

│   │   ├── models/        # Schematy danych

│   │   ├── routes/        # Endpointy API

│   │   ├── app.js         # Konfiguracja Express

│   │   └── server.js      # Uruchomienie serwera

│   └── package.json

└── frontend/

    ├── src/
    
    │   ├── components/    # Komponenty Vue
    
    │   ├── router/        # Routing
    
    │   ├── store/         # Zarządzanie stanem
    
    │   ├── views/         # Główne strony
    
    │   ├── App.vue        # Główny komponent
    
    │   └── main.js        # Inicjalizacja Vue
    
    └── package.json
**API Endpoints**
Autoryzacja:
POST /api/auth/register - Rejestracja

POST /api/auth/login - Logowanie

Nawyk (wymaga tokena):
GET /api/habits - Pobierz nawyki

POST /api/habits - Utwórz nawyk

PUT /api/habits/:id - Edytuj nawyk

DELETE /api/habits/:id - Usuń nawyk

POST /api/habits/:id/track - Śledź postęp

**Przykładowe requesty**
Rejestracja:

POST http://localhost:5001/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
Logowanie:

POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
Utworzenie nawyku:

POST http://localhost:5001/api/habits
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Morning Exercise",
  "description": "30 minutes every day",
  "category": "health",
  "frequency": "daily",
  "goal": 1
}
**Rozwiązywanie problemów**
1. Backend nie startuje
Sprawdź czy port 5001 jest wolny

Sprawdź czy .env jest poprawnie skonfigurowany

Uruchom npm install ponownie

2. Frontend nie łączy się z backendem
Sprawdź czy backend działa: http://localhost:5001/api/health

Sprawdź konsolę przeglądarki (F12 → Console)

Sprawdź zakładkę Network w DevTools

3. Błędy autoryzacji
Sprawdź czy token jest w localStorage

Sprawdź nagłówki Authorization w requestach

Sprawdź JWT_SECRET w .env

**Testowanie**
Otwórz http://localhost:5173

Zaloguj się z danymi test@example.com / password123

Utwórz nowy nawyk

Oznacz jako wykonany

Sprawdź statystyki na dashboard

**Uwagi**
Aplikacja używa pamięci jako bazy danych - dane są tracone po restarcie serwera

W produkcji należy użyć prawdziwej bazy danych (MongoDB, PostgreSQL)

Hasła nie są hashowane (tylko do celów rozwojowych)

**Autor**
Maja Grzeszczyk 159830

Wersja
1.0.0
