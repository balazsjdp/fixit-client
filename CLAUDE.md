# fixit-client – Next.js Frontend CLAUDE.md

## Technológiai stack

- **Framework**: Next.js 16.1.5 (App Router)
- **Nyelv**: TypeScript 5, strict mode
- **React**: 19.2.3
- **UI**: Radix UI + TailwindCSS 4 + shadcn-stílusú komponensek
- **State management**: Zustand 5 (Vanilla store + React context provider minta)
- **HTTP**: Axios 1.13.4 (SWR-rel kombinálva GET-ekhez)
- **Auth**: keycloak-js 26.2.2
- **Térkép**: Leaflet + react-leaflet (SSR bypass szükséges)
- **Ikonok**: Lucide React (dinamikus betöltéssel)
- **Toast**: Sonner
- **Téma**: next-themes (dark/light mode)

---

## Könyvtárstruktúra

```
fixit-client/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout (provider-ek, sidebar)
│   ├── page.tsx                 # Főoldal (→ /client/new)
│   ├── globals.css              # Globális stílusok + Tailwind
│   ├── login/                   # Bejelentkezés oldal
│   ├── register/                # Regisztráció oldal
│   ├── admin/                   # Admin panel (jóváhagyás, kreditek)
│   ├── pro/
│   │   ├── page.tsx             # Szakember dashboard (térkép, közeli munkák)
│   │   ├── register/            # Szakember regisztráció
│   │   └── offers/              # Saját ajánlatok listája
│   ├── client/
│   │   ├── new/                 # Új bejelentés form
│   │   └── my-reports/          # Bejelentések listája
│   ├── reports/
│   │   └── [id]/                # Bejelentés/munka részletes nézet (kliens + pro)
│   └── api/client/              # Kliens oldali API wrapper-ek és SWR hookok
│       ├── offers.ts            # submitOffer, acceptOffer, deleteOffer
│       ├── professionals.ts     # register, updateLocation, updateNotifications
│       ├── admin.ts             # approveProfessional, addCredits
│       ├── notifications.ts     # getNotifications, markNotificationsRead
│       ├── use-my-offers.ts     # SWR hook
│       ├── use-nearby-reports.ts# SWR hook
│       └── use-report-offers.ts # SWR hook
├── components/
│   ├── auth/
│   │   └── KeycloakProvider.tsx # Keycloak inicializálás
│   ├── features/                # Feature-specifikus komponensek
│   │   ├── badges/              # BadgeCard, ProfessionalBadges, UrgencyBadge, stb.
│   │   ├── address-form.tsx
│   │   ├── category-selector.tsx
│   │   ├── image-upload.tsx
│   │   ├── slider-selector.tsx
│   │   ├── my-offer-card.tsx
│   │   ├── notification-bell.tsx
│   │   ├── notification-toggle.tsx
│   │   ├── offer-modal.tsx
│   │   ├── pro-dashboard-map.tsx  # Leaflet térkép (SSR bypass, coverage-ből kizárva)
│   │   ├── pro-location-section.tsx
│   │   ├── pro-report-card.tsx
│   │   ├── professional-card.tsx
│   │   └── radius-slider.tsx
│   ├── ui/                      # Általános UI komponensek (shadcn-stílus)
│   │   ├── switch.tsx           # Radix Switch
│   │   ├── label.tsx            # Radix Label
│   │   └── [egyéb shadcn komponensek]
│   ├── app-sidebar.tsx          # Navigációs sidebar
│   └── theme-provider.tsx
├── store/                       # Zustand store-ok
│   ├── auth/                    # auth-store.ts + auth-store-provider.tsx
│   ├── config/                  # config-store.ts + config-store-provider.tsx
│   ├── report/                  # report-store.ts + report-store-provider.tsx
│   └── pro/                     # pro-register-store.ts + pro-register-store-provider.tsx
├── hooks/                       # Custom React hookok
│   ├── use-address-detection.ts # GPS + zip code egységes
│   ├── use-debounced-geocoding.ts # Nominatim integráció
│   ├── use-mobile.ts
│   └── use-nav-items.ts
├── lib/
│   └── api.ts                   # Axios instance + token interceptor (coverage-ből kizárva)
├── types/                       # TypeScript típusdefiníciók + DTO-k
└── public/                      # Statikus fájlok
```

---

## Provider hierarchia (layout.tsx)

```
KeycloakProvider
  └── ThemeProvider
        └── AuthStoreProvider
              └── ConfigStoreProvider
                    └── SidebarProvider
                          └── AppSidebar + tartalom
```

---

## State management (Zustand)

**Minta**: Vanilla store + React context provider (szerver komponensekkel kompatibilis).

### AuthStore (`store/auth/`)
- State: `user`, `token`, `isAuthenticated`, `isLoading`
- Actions: `login()`, `logout()`, `setLoading()`
- Perzisztálva: localStorage

### ConfigStore (`store/config/`)
- State: `config` (version, menuItems, featureFlags, badges)
- Actions: `setConfig()`
- A `/api/config` végpontról töltődik fel induláskor

### ReportStore (`store/report/`)
- State: `form` (category, files, description, urgency, address)
- Actions: `setCategory()`, `setFiles()`, `setDescription()`, `setUrgency()`, `setAddress()`, `resetForm()`
- Nem perzisztált (oldal újratöltéskor resetelődik)

### ProRegisterStore (`store/pro/`)
- State: regisztrációs form adatok
- Actions: form field setterek

---

## API kliens (`lib/api.ts`)

- Axios instance, base URL: `http://localhost:8080`
- **Interceptor**: minden kéréshez automatikusan hozzáadja a Keycloak Bearer tokent
- **401 kezelés**: automatikus token refresh kísérlet
- GET kérések: **SWR** hook-okkal (caching, revalidation)
- POST/PATCH/DELETE kérések: közvetlen API hívás

---

## Auth flow (Keycloak)

1. `KeycloakProvider` inicializálja a keycloak-js-t app betöltéskor
2. PKCE flow a biztonság érdekében
3. Tokenek localStorage-ban: `kc_token`, `kc_refreshToken`
4. Silent SSO check a zökkenőmentes újrahitelesítéshez
5. `AuthStore` tükrözi az auth állapotot az alkalmazáson belül

---

## Routing (App Router)

| Útvonal               | Leírás                                        |
|-----------------------|-----------------------------------------------|
| `/`                   | Főoldal (→ `/client/new`)                     |
| `/login`              | Bejelentkezés                                 |
| `/register`           | Regisztráció                                  |
| `/admin`              | Admin panel (jóváhagyás, kreditek)            |
| `/client/new`         | Új bejelentés form                            |
| `/client/my-reports`  | Bejelentések listája                          |
| `/reports/[id]`       | Bejelentés/munka részletes nézet (kliens+pro) |
| `/pro`                | Szakember dashboard (térkép, munkák)          |
| `/pro/register`       | Szakember regisztráció                        |
| `/pro/offers`         | Saját ajánlatok listája                       |

---

## UI konvenciók

- **`"use client"`** direktíva minden interaktív komponenshez
- **shadcn-stílusú** komponensek: `class-variance-authority` + `tailwind-merge` + `clsx`
- **Radix UI** primitívek az akadálymentességért
- **Mobile-first** Tailwind breakpointok (`sm:`, `md:`, `lg:`)
- **Dark mode**: `next-themes`, CSS változókkal
- **Toast értesítések**: `sonner` (top-right pozíció, richColors)
- **Skeleton loading** adatlekérés közben
- **Root layout**: `SidebarProvider` + `p-6` padding minden oldalon

---

## Ikonok

Lucide React ikonok **dinamikusan** töltődnek be ikon névből:
- `category-selector.tsx` komponens valósítja meg
- Az icon neveket a backend `/api/categories` végpontja adja vissza

---

## Fejlesztés

```bash
# Indítás (dev mode)
npm run dev

# Build
npm run build

# Lint
npm run lint

# Format (prettier)
npx prettier --write .
```

**Dev URL**: http://localhost:3000

---

## Konfiguráció

- `next.config.ts` – Next.js konfiguráció
- `postcss.config.mjs` + `tailwind.config` – TailwindCSS 4
- `components.json` – shadcn komponens konfiguráció
- `tsconfig.json` – TypeScript strict mode, `@/` path alias a projekt gyökerére

---

## Típusbiztonság

- Backend Go struktúrák és TypeScript típusok **manuálisan szinkronizálva** (nincs automatikus generálás)
- API response típusok: `types/` könyvtárban
- Ha az API kontrakt változik, frissíteni kell mindkét helyen
- Go `Category.ID` (int) → TS `Category.id` (string): mindig `String(c.id)` összehasonlítással kell dolgozni

---

## Tesztelés

### Stack

- **Unit tesztek**: Vitest + React Testing Library + jsdom
- **E2E tesztek**: Playwright (Chromium, storageState alapú Keycloak auth)
- Fájlok: `*.test.ts` / `*.test.tsx` suffix, a tesztelt fájl mellé
- E2E fájlok: `e2e/` könyvtárban, `*.spec.ts` suffix

### Unit tesztek futtatása

```bash
# Watch mode (fejlesztés közben)
npm run test

# Egyszeri futás + coverage report
npm run test:coverage
# Report: coverage/index.html
```

### Coverage thresholdok

| Metrika     | Minimum |
|-------------|---------|
| Lines       | 90%     |
| Functions   | 90%     |
| Statements  | 90%     |
| Branches    | 85%     |

**Jelenlegi coverage**: ~93%

**Coverage-ből kizárva** (`vitest.config.ts`):
- `lib/api.ts`
- `store/**/*-provider.tsx`
- `components/features/pro-dashboard-map.tsx` (Leaflet nem fut jsdom-ban)

**Vitest-ből kizárva**: `e2e/**` (Playwright fájlok nem futnak Vitest alatt)

### E2E tesztek futtatása

```bash
# E2E (headless, futó app + Keycloak szükséges)
npm run e2e

# E2E interaktív UI módban
npm run e2e:ui
```

**Szükséges ENV változók E2E-hez** (`.env.local`):
```
E2E_USERNAME=e2e-testuser@fixit.local
E2E_PASSWORD=e2etest1234
E2E_PRO_USERNAME=e2e-prouser@fixit.local
E2E_PRO_PASSWORD=e2etest1234
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=FixIt
BASE_URL=http://localhost:3000
```

**Playwright projektek:**
- `setup` / `pro-setup` – storageState alapú Keycloak login
- `chromium` – kliens user, minden `*.spec.ts` KIVÉVE `pro-*.spec.ts`
- `pro-chromium` – pro user, csak `pro-*.spec.ts` fájlok

**E2E userek Keycloakban** (kézzel létrehozva, realm reimport nem hozza létre újra):
- client: `e2e-testuser@fixit.local` / `e2etest1234`
- pro: `e2e-prouser@fixit.local` / `e2etest1234` → `professionals` táblában is seedelve

### Mock stratégia

- `vi.mock('next/navigation')` – router mock (`vitest.setup.ts`)
- `vi.mock('next/link')` – Link mock (`vitest.setup.ts`)
- Zustand store-ok: singleton direkt hívás, `resetForm()` a `beforeEach`-ben
- SWR hookok: `vi.mock('@/app/api/...')` a tesztben
- Nominatim: Playwright-ban `page.route()` mockkal (instant koordináta visszaadás)
- `global.URL.createObjectURL` – jsdom stub fájl tesztekhez

### Merge policy (kötelező)

> **TILOS** masterbe mergelni, ha:
> - `npm run test:coverage` hibával fut
> - Bármely coverage threshold **nem teljesül**
> - Playwright E2E tesztek **nem futnak le sikeresen** lokálisan
> - Új komponenshez/hook-hoz/store action-höz nincs unit teszt
