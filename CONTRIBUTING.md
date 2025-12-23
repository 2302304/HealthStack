# Contributing to HealthStack

Kiitos kiinnostuksestasi osallistua HealthStack-projektiin!

## Kehitysympäristön pystytys

### Vaatimukset

- Node.js 18+
- npm tai yarn
- PostgreSQL 15+ (tai Docker)
- Git

### 1. Kloonaa repositorio

```bash
git clone https://github.com/2302304/HealthStack.git
cd HealthStack
```

### 2. Asenna riippuvuudet

```bash
# Root-tason riippuvuudet
npm install

# Backend-riippuvuudet
cd backend
npm install
```

### 3. Konfiguroi ympäristö

Kopioi `.env.example` tiedosto `.env`:ksi:

```bash
cd backend
cp .env.example .env
```

Muokkaa `.env`-tiedostoa tarpeen mukaan.

### 4. Käynnistä PostgreSQL

**Docker (suositeltu):**
```bash
docker-compose up -d
```

**Tai käytä paikallista PostgreSQL-asennusta** ja päivitä `DATABASE_URL` `.env`-tiedostossa.

### 5. Suorita tietokantamigraatiot

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Valinnainen: lataa testidataa
```

### 6. Käynnistä kehitysserveri

```bash
npm run dev
```

Backend käynnistyy osoitteessa `http://localhost:3001`

## Git Workflow

### Branch-nimeämiskäytännöt

- `feature/ominaisuuden-nimi` - Uudet ominaisuudet
- `fix/bugin-kuvaus` - Bugien korjaukset
- `refactor/kuvaus` - Koodin refaktorointi
- `docs/kuvaus` - Dokumentaation päivitykset

### Commit-viestit

Käytä selkeitä, kuvaavia commit-viestejä:

```
feat: Add sleep tracking endpoint
fix: Correct JWT token expiration handling
refactor: Improve error handling middleware
docs: Update API documentation
```

**Muoto:**
- `feat:` - Uusi ominaisuus
- `fix:` - Bugikorjaus
- `refactor:` - Koodin refaktorointi
- `docs:` - Dokumentaatio
- `test:` - Testit
- `chore:` - Ylläpito (riippuvuudet, build, jne.)

### Pull Request -prosessi

1. Forkkaa repositorio
2. Luo uusi branch (`git checkout -b feature/amazing-feature`)
3. Tee muutoksesi
4. Commitoi muutokset (`git commit -m 'feat: Add amazing feature'`)
5. Pushaa branch (`git push origin feature/amazing-feature`)
6. Avaa Pull Request GitHubissa

**Pull Request -checklist:**
- [ ] Koodi noudattaa projektin tyyliä
- [ ] Kaikki testit menevät läpi
- [ ] Dokumentaatio on päivitetty
- [ ] Commit-viestit ovat selkeitä
- [ ] Ei merge-konflikteja

## Koodin tyyliohjeet

### TypeScript

- Käytä strict mode -asetuksia
- Määrittele tyypit eksplisiittisesti
- Vältä `any`-tyyppiä
- Käytä interfaceja ja typejä

```typescript
// Hyvä
interface User {
  id: string;
  email: string;
  name: string;
}

const getUser = async (userId: string): Promise<User> => {
  // ...
}

// Huono
const getUser = async (userId: any): Promise<any> => {
  // ...
}
```

### Nimeämiskäytännöt

- **Muuttujat ja funktiot**: camelCase (`getUserById`, `isValid`)
- **Luokat ja interfacet**: PascalCase (`UserController`, `AuthService`)
- **Konstantit**: UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`)
- **Tiedostot**: kebab-case (`auth.controller.ts`, `user.service.ts`)

### Virheenkäsittely

Käytä `AppError`-luokkaa kustomoiduille virheille:

```typescript
if (!user) {
  throw new AppError('User not found', 404);
}
```

### Validointi

Käytä Zod-skeemoja kaikille inputeille:

```typescript
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});
```

## Tietokannan muutokset

### Prisma-migraatiot

1. Muokkaa `schema.prisma`-tiedostoa
2. Luo migraatio:
```bash
npm run prisma:migrate
```

3. Anna migraatiolle kuvaava nimi (esim. "add_sleep_tracking")

### Seed-datan päivitys

Jos lisäät uusia malleja, päivitä `prisma/seed.ts` sisältämään esimerkkidataa.

## Testaus

### API-testaus

Käytä curl, Postman tai Thunder Client -laajennusta VS Codessa.

**Esimerkki:**
```bash
# Kirjaudu sisään
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@healthstack.com","password":"Demo1234"}'

# Käytä tokenia
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Tietoturva

### Huomioitavaa

- **ÄLÄ KOSKAAN** commitoi `.env`-tiedostoja
- **ÄLÄ** tallenna salasanoja tai API-avaimia koodiin
- Käytä aina parametrisoituja kyselyitä (Prisma hoitaa tämän)
- Validoi kaikki käyttäjän syötteet
- Käytä HTTPS tuotannossa

### Tietoturvaongelmat

Jos löydät tietoturvaongelman, **ÄLÄ** avaa julkista issuea. Ota yhteyttä suoraan projektin ylläpitäjään.

## Kysymykset ja tuki

- **Bugit**: Avaa [GitHub Issue](https://github.com/2302304/HealthStack/issues)
- **Ominaisuuspyynnöt**: Avaa [GitHub Issue](https://github.com/2302304/HealthStack/issues)
- **Kysymykset**: Käytä [GitHub Discussions](https://github.com/2302304/HealthStack/discussions)

## Lisenssi

Osallistumalla tähän projektiin hyväksyt, että panoksesi lisensioidaan MIT-lisenssillä.

---

Kiitos panoksestasi HealthStackiin! 🎉
