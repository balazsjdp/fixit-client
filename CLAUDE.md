# fixit-client – Next.js Frontend CLAUDE.md

## Technológiai stack

- **Framework**: Next.js 16.1.5 (App Router)
- **Nyelv**: TypeScript 5, strict mode
- **React**: 19.2.3
- **UI**: Radix UI + TailwindCSS 4 + shadcn-stílusú komponensek
- **State management**: Zustand 5 (Vanilla store + React context provider minta)
- **HTTP**: Axios 1.13.4 (SWR-rel kombinálva GET-ekhez)
- **Auth**: keycloak-js 26.2.2
- **Ikonok**: Lucide React (dinamikus betöltéssel)
- **Toast**: Sonner
- **Téma**: next-themes (dark/light mode)

---

## Könyvtárstruktúra

```
fixit-client/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (provider-ek, sidebar)
│   ├── page.tsx            # Főoldal (átirányít /client/new-ra)
│   ├── globals.css         # Globális stílusok + Tailwind
│   ├── login/              # Bejelentkezés oldal
│   ├── register/           # Regisztráció oldal
│   ├── pro/                # Szakember dashboard (stub)
│   ├── client/
│   │   ├── new/            # Új bejelentés form
│   │   └── my-reports/     # Bejelentéseim lista + részletek
│   └── api/                # Kliens oldali API wrapper-ek
├── components/
│   ├── auth/
│   │   └── KeycloakProvider.tsx    # Keycloak inicializálás
│   ├── features/           # Feature-specifikus komponensek
│   │   ├── category-selector.tsx
│   │   ├── image-upload.tsx
│   │   ├── slider-selector.tsx
│   │   └── address-form.tsx
│   ├── ui/                 # Általános UI komponensek (shadcn-stílus)
│   ├── app-sidebar.tsx     # Navigációs sidebar
│   └── theme-provider.tsx
├── store/                  # Zustand store-ok
│   ├── auth/               # auth-store.ts + auth-store-provider.tsx
│   ├── config/             # config-store.ts + config-store-provider.tsx
│   └── report/             # report-store.ts + report-store-provider.tsx
├── lib/
│   └── api.ts              # Axios instance + token interceptor
├── hooks/                  # Custom React hookok
├── types/                  # TypeScript típusdefiníciók + DTO-k
└── public/                 # Statikus fájlok
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

**Minta**: Vanilla store + React context provider, hogy szerver komponensekkel is kompatibilis legyen.

### AuthStore (`store/auth/`)
- State: `user`, `token`, `isAuthenticated`, `isLoading`
- Actions: `login()`, `logout()`, `setLoading()`
- Perzisztálva: localStorage

### ConfigStore (`store/config/`)
- State: `config` (version, menuItems, featureFlags)
- Actions: `setConfig()`
- A `/api/config` végpontról töltődik fel induláskor

### ReportStore (`store/report/`)
- State: `form` (category, files, description, urgency, address)
- Actions: `setCategory()`, `setFiles()`, `setDescription()`, `setUrgency()`, `setAddress()`, `resetForm()`
- Nem perzisztált (oldal újratöltéskor resetelődik)

---

## API kliens (`lib/api.ts`)

- Axios instance, base URL: `http://localhost:8080`
- **Interceptor**: minden kéréshez automatikusan hozzáadja a Keycloak Bearer tokent
- **401 kezelés**: automatikus token refresh kísérlet
- GET kérések: **SWR** hook-okkal (caching, revalidation)
- POST kérések: közvetlen API hívás

---

## Auth flow (Keycloak)

1. `KeycloakProvider` inicializálja a keycloak-js-t app betöltéskor
2. PKCE flow a biztonság érdekében
3. Tokenek localStorage-ban: `kc_token`, `kc_refreshToken`
4. Silent SSO check a zökkenőmentes újrahitelesítéshez
5. `AuthStore` tükrözi az auth állapotot az alkalmazáson belül

---

## Ikonok

Lucide React ikonok **dinamikusan** töltődnek be ikon névből:
- `category-selector.tsx` komponens valósítja meg
- Az icon neveket a backend `/api/categories` végpontja adja vissza

---

## UI konvenciók

- **`"use client"`** direktíva minden interaktív komponenshez
- **shadcn-stílusú** komponensek: `class-variance-authority` + `tailwind-merge` + `clsx`
- **Radix UI** primitívek az akadálymentességért
- **Mobile-first** Tailwind breakpointok (`sm:`, `md:`, `lg:`)
- **Dark mode**: `next-themes`, CSS változókkal
- **Toast értesítések**: `sonner` (top-right pozíció, richColors)
- **Skeleton loading** adatlekérés közben

---

## Routing (App Router)

| Útvonal              | Leírás                        |
|----------------------|-------------------------------|
| `/`                  | Főoldal (→ `/client/new`)     |
| `/login`             | Bejelentkezés                 |
| `/register`          | Regisztráció                  |
| `/client/new`        | Új bejelentés form            |
| `/client/my-reports` | Bejelentések listája          |
| `/client/my-reports/[id]` | Bejelentés részletei    |
| `/pro`               | Szakember dashboard (stub)    |

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
- API response típusok: `types/` könyvtárban, pl. `reportCreationResponse.dto.ts`
- Ha az API kontrakt változik, frissíteni kell mindkét helyen

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

A `vitest.config.ts` kizárja az infrastruktúra fájlokat (`lib/api.ts`, provider-ek).

### E2E tesztek futtatása

```bash
# E2E (headless, futó app + Keycloak szükséges)
npm run e2e

# E2E interaktív UI módban
npm run e2e:ui
```

**Szükséges ENV változók E2E-hez** (`.env.local`):
```
E2E_USERNAME=testuser
E2E_PASSWORD=password
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=FixIt
BASE_URL=http://localhost:3000
```

### Mock stratégia

- `vi.mock('next/navigation')` – router mock (`vitest.setup.ts`)
- `vi.mock('next/link')` – Link mock (`vitest.setup.ts`)
- Zustand store-ok: `reportStore` singleton direkt hívás, `resetForm()` a `beforeEach`-ben
- SWR hookok: `vi.mock('@/app/api/...')` a tesztben
- `global.URL.createObjectURL` – jsdom stub fájl tesztekhez

### Merge policy (kötelező)

> **TILOS** masterbe mergelni, ha:
> - `npm run test:coverage` hibával fut
> - Bármely coverage threshold **nem teljesül**
> - Playwright E2E tesztek **nem futnak le sikeresen** lokálisan
> - Új komponenshez/hook-hoz/store action-höz nincs unit teszt
