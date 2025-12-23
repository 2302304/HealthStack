# HealthStack

Full-stack terveyden ja hyvinvoinnin seurantasovellus.

## Ominaisuudet

- **Ravinnon seuranta**: Kirjaa aterioita ja ravintoarvoja (kalorit, proteiini, hiilihydraatit, rasva)
- **Liikunta**: Seuraa harjoittelua, kestoa, kaloreita ja intensiteettiä
- **Uni**: Kirjaa unen määrää ja laatua
- **Mieliala**: Seuraa mielialaa, energiaa ja stressitasoja
- **Ateriasuunnittelu**: Luo ruokavaliosuunnitelmia (keto, low-carb, jne.)
- **Ostoslistat**: Generoi ostoslistoja ateriasuunnitelmista

## Teknologiat

### Backend
- **Node.js** + **TypeScript**
- **Express** - REST API
- **Prisma** - ORM ja tietokantamigraatiot
- **PostgreSQL** - Tietokanta
- **JWT** - Autentikointi
- **bcrypt** - Salasanan hashaus
- **Zod** - Validointi
- **Helmet** + **CORS** - Tietoturva

### Frontend (tulossa)
- **React** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Navigaatio
- **Axios** - HTTP client

## Projektin rakenne

```
HealthStack/
├── backend/
│   ├── src/
│   │   ├── config/         # Konfiguraatio (env, database)
│   │   ├── controllers/    # Route kontrollerit
│   │   ├── middleware/     # Express middlewaret
│   │   ├── routes/         # API reitit
│   │   ├── utils/          # Apufunktiot (auth, jne.)
│   │   ├── validators/     # Zod-skemat
│   │   └── index.ts        # Pääserveri
│   ├── prisma/
│   │   ├── schema.prisma   # Tietokantamalli
│   │   └── seed.ts         # Seed-data
│   ├── .env.example
│   └── package.json
├── frontend/              # (tulossa)
└── package.json           # Monorepo root
```

## Asennus ja käyttöönotto

### 1. Kloonaa repositorio ja asenna riippuvuudet

```bash
# Asenna root-tason riippuvuudet (concurrently)
npm install

# Asenna backend-riippuvuudet
cd backend
npm install
```

### 2. Konfiguroi ympäristömuuttujat

Kopioi `.env.example` -> `.env` backend-kansiossa:

```bash
cd backend
cp .env.example .env
```

Muokkaa `.env`-tiedostoa:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/healthstack?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Käynnistä PostgreSQL

Voit käyttää joko paikallista PostgreSQL-asennusta tai Docker Composea:

**Docker Compose** (suositeltu kehitykseen):

Luo `docker-compose.yml` juurikansioon:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: healthstack
      POSTGRES_PASSWORD: healthstack
      POSTGRES_DB: healthstack
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Käynnistä:

```bash
docker-compose up -d
```

### 4. Suorita tietokantamigraatiot

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 5. (Valinnainen) Lataa seed-data

```bash
npm run prisma:seed
```

Tämä luo demo-käyttäjän:
- Email: `demo@healthstack.com`
- Password: `Demo1234`

### 6. Käynnistä backend-serveri

```bash
npm run dev
```

Serveri käynnistyy osoitteessa `http://localhost:3001`

## API Endpointit

### Autentikointi

- `POST /api/auth/register` - Rekisteröidy
- `POST /api/auth/login` - Kirjaudu sisään
- `GET /api/auth/me` - Hae nykyinen käyttäjä (vaatii tokenin)

### Ruokapäiväkirja

- `POST /api/food-logs` - Luo uusi merkintä
- `GET /api/food-logs` - Hae kaikki merkinnät (query: startDate, endDate, mealType)
- `GET /api/food-logs/:id` - Hae yksittäinen merkintä
- `PUT /api/food-logs/:id` - Päivitä merkintä
- `DELETE /api/food-logs/:id` - Poista merkintä

### Liikunta

- `POST /api/exercises` - Luo uusi merkintä
- `GET /api/exercises` - Hae kaikki merkinnät
- `GET /api/exercises/:id` - Hae yksittäinen merkintä
- `PUT /api/exercises/:id` - Päivitä merkintä
- `DELETE /api/exercises/:id` - Poista merkintä

## Testaus API:n kanssa

### 1. Rekisteröidy

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }'
```

### 2. Kirjaudu sisään

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

Tallenna vastauksen `token`.

### 3. Luo ruokamerkintä

```bash
curl -X POST http://localhost:3001/api/food-logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "foodName": "Kaurapuuro",
    "calories": 350,
    "protein": 12,
    "carbs": 55,
    "fat": 8,
    "mealType": "BREAKFAST"
  }'
```

## Tuotantoon julkaisu

### Railway (Backend + PostgreSQL)

1. Luo projekti Railway.app:ssa
2. Lisää PostgreSQL-tietokanta
3. Linkitä GitHub-repositoriosi
4. Aseta ympäristömuuttujat:
   - `DATABASE_URL` (automaattinen PostgreSQL:stä)
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CORS_ORIGIN` (frontend URL)

### Vercel (Frontend - tulossa)

1. Linkitä GitHub-repositorio
2. Määritä root directory: `frontend`
3. Aseta ympäristömuuttujat

## Tietoturva

- ✅ Salasanat hashattu bcryptillä (10 rounds)
- ✅ JWT-tokenien validointi
- ✅ Helmet.js HTTP-headerien suojaukseen
- ✅ CORS-konfiguraatio
- ✅ Rate limiting (100 req/15min)
- ✅ Input-validointi Zodilla
- ✅ Ympäristömuuttujat .env-tiedostossa
- ✅ SQL injection -suojaus (Prisma ORM)

## Seuraavat vaiheet

- [ ] Frontend React-sovellus
- [ ] Uni- ja mielialalokit (API on jo valmis)
- [ ] Ateriasuunnittelu ja ostoslistat
- [ ] Dashboard analytiikalla
- [ ] Kaaviot ja tilastot
- [ ] PWA-tuki
- [ ] Tummateema

## Lisenssi

MIT
