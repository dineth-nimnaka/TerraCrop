# TerraCrop — Location-Based Smart Agriculture & Crop Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Web_SDK_v11-orange.svg)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-green.svg)](https://vitest.dev/)

TerraCrop is an online agro-intelligence web application built for the **NASA Space Apps Challenge: "Field Shift: Adapting Farms with NASA Data"**. Focused on farmers in Sri Lanka (particularly in dry and intermediate agro-ecological zones), TerraCrop evaluates historical Earth observation data from the **NASA POWER Agroclimatology (AG)** community, integrates field check-in parameters and soil provenance, and executes a deterministic **FAO-56 Penman-Monteith** rules engine to recommend adapted crop rotations.

---

## 🌟 Key Capabilities & Architectural Pillars

1. **Strictly Authenticated App**:
   - Clean, modern, responsive landing page explains the platform without requiring login.
   - All interactive application features (Fields, Climate, Check-in, Strategies, Community, PDF Export) require Firebase Authentication (Email & Password).
   - Email verification enforcement for public knowledge sharing in the Community.
2. **Interactive Geographic Field Management**:
   - HTML5 Geolocation with graceful denial and timeout handling.
   - Interactive OpenStreetMap via Leaflet with custom SVG brand-colored pins (no broken asset paths).
   - Reverse geocoding via Nominatim (throttled to >1s per request, client-cached) to automatically identify districts and villages.
   - Privacy protection: exact GPS coordinates are kept private and never exposed in community postings or public reports unless explicit farmer consent is granted.
3. **Real NASA POWER Agroclimatology (AG) Pipeline**:
   - Queries the official NASA POWER API (`https://power.larc.nasa.gov/api/temporal/daily/point`) for daily observations covering the previous 90 days.
   - Parameters:
     - `PRECTOTCORR`: Corrected precipitation from MERRA-2 assimilation model (labelled correctly as POWER/MERRA-2, *not* satellite GPM).
     - `T2M`, `T2M_MAX`, `T2M_MIN`: 2-meter air temperature profile (°C).
     - `RH2M`: Relative humidity (%).
     - `WS2M`: Wind speed at 2 meters (m/s).
     - `ALLSKY_SFC_SW_DWN`: All-sky surface shortwave downward irradiance (MJ/m²/day).
     - `GWETROOT`: Root-zone soil wetness fraction (0.0 to 1.0 dimensionless fraction).
   - Validates responses, strictly treating `-999` and non-finite values as **MISSING** (never invented as zero).
   - Displays clear data source notices, parameter keys, units, date ranges, and spatial resolution (~0.5° × 0.625° regional grid, not field-level).
   - Caches data in Cloud Firestore (`users/{uid}/climateCache/{fieldId}`) with `fetchedAt` timestamps (24-hour TTL).
4. **Comprehensive Field Check-In**:
   - Records current crop status, previous rotation history, land tenure (owned vs leased + lease expiration date), desired harvest window, water access (rain-fed, canal, well + reliability).
   - Optional soil characteristics (texture, pH, drainage, organic matter) allowing "Unknown" states and recording provenance (*farmer estimate*, *lab test*, *extension officer*).
   - Wildlife observations (wild boar, monkeys, peafowl, elephants) recorded for awareness only—**never** auto-penalizes or auto-excludes crops.
5. **Deterministic Agronomy Engine (Pure TypeScript & Unit-Tested)**:
   - Versioned crop catalogue (`data/crops.json`) with documented FAO/DOA reference sources for every value.
   - Full **FAO-56 Penman-Monteith** formulation for Reference Evapotranspiration ($ET_0$) and crop evapotranspiration ($ET_c = K_c \times ET_0$) computed only when inputs are sufficient.
   - Automatic weight renormalization when optional components (such as soil or climate) are missing, displaying data coverage percentages.
   - Botanical family rotation break checks preventing continuous planting of same-family crops (e.g. Poaceae after Rice).
   - Three distinct strategies:
     1. *Current Practice Baseline*: Multi-factor suitability ranking.
     2. *Soil-Building Rotation*: Strictly filters for legumes and cover crops with peer-reviewed soil regeneration evidence.
     3. *Constraint-Adapted Best Match*: Optimizes for drought resilience, short tenancy windows, or drainage bottlenecks.
   - Interactive rainfall what-if sensitivity slider (-30% to +30% in 5% steps), labelled *"What-if scenario — not a forecast"*.
   - Strictly agronomist-focused: no invented yield numbers, fertilizer savings, chemical pesticide advice, or animal deterrent claims.
6. **Gemini AI Agronomic Explanations (Firebase AI Logic Web SDK)**:
   - Powered by Gemini Developer API (`gemini-2.0-flash`) via `firebase/ai`.
   - Sends **only computed agronomic facts** (crop name, score breakdown, constraints, data sources). Never transmits farmer name, email, or exact GPS coordinates.
   - Structured JSON output (`summary`, `why_it_may_fit`, `risks_to_check`, `evidence_references`, `disclaimer`).
   - Validated schema with deterministic fallback templates if offline or timeout occurs. AI never overrides rules engine rankings.
7. **Farmer Community Forum**:
   - Post categories: *Crop Questions*, *Seed Availability*, *Market Information*.
   - District filter (all 25 administrative districts of Sri Lanka) or island-wide view.
   - Posting and replying requires verified email (`request.auth.token.email_verified == true`).
   - Moderation reporting mechanism (`communityReports`).
8. **Client-Side A4 PDF Export**:
   - Compiles field info, observed NASA POWER parameters, soil provenance, score breakdowns, caveats, and algorithm/catalogue versions into a clean A4 PDF.
   - Redacts exact GPS coordinates unless the user explicitly checks the consent checkbox.
   - Features mandatory disclaimer: *"Verify with a local agricultural extension officer prior to planting"*.

---

## 🏗️ Project Architecture & Structure

```
terracrop/
├── data/
│   └── crops.json                       # Versioned crop catalogue with FAO/DOA sources
├── public/
│   └── favicon.svg                      # Brand icon
├── src/
│   ├── app/
│   │   ├── LandingPage.tsx              # Public informational landing page
│   │   └── Router.tsx                   # React Router route hierarchy
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx            # Desktop sidebar & mobile navigation bar
│   │   │   └── ProtectedRoute.tsx       # Auth gatekeeper with loading states
│   │   └── ui/
│   │       ├── Button.tsx               # Touch-friendly buttons (min 48px target)
│   │       ├── Card.tsx                 # Rounded 20px cards with soft shadows
│   │       ├── EmptyState.tsx           # Standard empty state illustration
│   │       ├── ErrorState.tsx           # Error alert with retry triggers
│   │       └── LoadingSpinner.tsx       # Forest Green spinner
│   ├── domain/
│   │   └── agronomy/
│   │       ├── __tests__/
│   │       │   └── scoringEngine.test.ts # Vitest suite (8 tests)
│   │       ├── constants.ts             # Seasons, versions, score weights
│   │       ├── cropCatalogue.ts         # Crop data loader
│   │       ├── et0.ts                   # FAO-56 Penman-Monteith ET0 & ETc calculation
│   │       ├── scoringEngine.ts         # Pure deterministic suitability engine
│   │       └── strategies.ts            # Three rotation strategy generators
│   ├── features/
│   │   ├── auth/                        # Login, SignUp, ResetPassword
│   │   ├── checkin/                     # Field check-in form & Firestore hooks
│   │   ├── climate/                     # NASA POWER dashboard, rainfall & temp charts
│   │   ├── community/                   # Discussions, replies, pagination & reports
│   │   ├── fields/                      # Field CRUD, Leaflet map & dashboard
│   │   ├── reports/                     # jsPDF client-side A4 generator & consent
│   │   └── settings/                    # Profile, units, AI toggle & attributions
│   ├── hooks/
│   │   └── useAuth.ts                   # Firebase Auth context & observer
│   ├── services/
│   │   ├── firebase.ts                  # Firebase App, Auth, Firestore & AI init
│   │   ├── geminiService.ts             # Firebase AI Logic (Gemini 2.0 Flash)
│   │   ├── nasaPower.ts                 # NASA POWER AG daily point API client
│   │   └── nominatim.ts                 # Throttled OpenStreetMap reverse geocoding
│   ├── types/
│   │   └── index.ts                     # Core TypeScript interfaces & types
│   ├── utils/
│   │   └── dateUtils.ts                 # Date formatters & calculations
│   ├── index.css                        # Tailwind v4 theme & Inter typography
│   └── main.tsx                         # Application root
├── .env.example                         # Environment variable template
├── firebase.json                        # Firebase Hosting & Firestore deployment configuration
├── firestore.rules                      # Deny-by-default Firestore security rules
├── firestore.indexes.json               # Firestore compound query indexes
├── package.json
├── tsconfig.json
└── vite.config.ts                       # Vite 6 + Tailwind v4 + Vitest configuration
```

---

## 🎨 Design System Tokens

- **Forest Green** (`#1B4332`): Primary brand color, headers, action buttons.
- **Sage Mist** (`#F3F7F4`): Canvas background.
- **Ink** (`#0F172A`): High-contrast primary typography (WCAG AA compliant).
- **Slate** (`#475569`): Secondary metadata and descriptions.
- **Soil Sky** (`#E0F2FE`): Water access indicators and informative highlights.
- **Rain Sun** (`#FEF3C7`): Climate alerts and scenarios.
- **Risk Mint** (`#DCFCE7`): Legumes and positive soil-building tags.
- **Minimum Touch Targets**: All interactive buttons, nav links, and form fields enforce at least `48px` minimum touch targets for mobile usability in the field.

---

## 🚀 Setup & Local Development

### 1. Prerequisites
- **Node.js**: v20 or later
- **npm**: v10 or later

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/dineth-nimnaka/TerraCrop.git
cd TerraCrop
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase Web App credentials:
```bash
cp .env.example .env
```
Populate `.env`:
```ini
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=terracrop-new.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=terracrop-new
VITE_FIREBASE_STORAGE_BUCKET=terracrop-new.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

### 5. Run Vitest Unit Tests
```bash
npm test
```

### 6. Run TypeScript Type Check & Build
```bash
npm run lint
npm run build
```

---

## 🔒 Security & Firestore Rules

TerraCrop enforces a **deny-by-default** policy in `firestore.rules`:
- **Private Data (`users/{uid}/**`)**: A user can only read and write documents within their own UID path (`request.auth.uid == uid`).
- **Input Validation**: Field coordinates are strictly validated (`latitude >= -90 && latitude <= 90`, `longitude >= -180 && longitude <= 180`). Names are capped at 200 characters.
- **Community Integrity**:
  - Only authenticated users with a **verified email** (`request.auth.token.email_verified == true`) can create posts or replies.
  - The `authorUid` must match `request.auth.uid`.
  - Client-side role tampering or moderation fields are strictly rejected: `(!('role' in request.resource.data)) && (!('moderation' in request.resource.data))`.
- **Reports**: `communityReports` is **create-only** by authenticated users; users cannot read, edit, or delete existing reports.

---

## 🚢 Deploying to Firebase Hosting & Firestore

To deploy the built application and security rules to Firebase Hosting:
```bash
# 1. Build the production client
npm run build

# 2. Deploy hosting and firestore rules
firebase deploy --only hosting,firestore
```

---

## 📜 Scientific References & Attribution

- **NASA POWER Project**: Prediction of Worldwide Energy Resources. Langley Research Center (LaRC). Data community: Agroclimatology (AG). [power.larc.nasa.gov](https://power.larc.nasa.gov/)
- **FAO-56**: Allen, R.G., Pereira, L.S., Raes, D., Smith, M. (1998). *Crop evapotranspiration - Guidelines for computing crop water requirements*. FAO Irrigation and Drainage Paper 56. Rome: Food and Agriculture Organization of the United Nations.
- **Department of Agriculture, Sri Lanka (DOA)**: Dry zone grain legume research bulletins and crop cultivation handbooks (Peradeniya, Sri Lanka).
- **OpenStreetMap & Nominatim**: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors. Open Database License (ODbL).
 
**Live Application:** [TerraCrop Web App](https://terracrop-new.web.app/) 
