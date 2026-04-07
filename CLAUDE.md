# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Development server at localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run lint       # ESLint checks
```

No test framework is configured in this project.

## Architecture

This is a React 19 + TypeScript SPA built with Vite 7 and Tailwind CSS 4. It fetches real-time badminton court availability from DBKL's public API.

**State lives in `App.tsx`** — all filter state (date, locationId, consecutive slots, time range, min courts) is managed there and passed down as props.

**Data fetching is done entirely through custom hooks** in `src/hooks/`:
- `useLocations` — fetches the full list of 72+ DBKL locations (cached for session)
- `useFacility` — fetches court slots for a single location
- `useAllFacilities` — batch-fetches all locations (10 at a time, 200ms delay) with progress tracking
- `useLocationDetails` — fetches lat/lng and parliament info per location (localStorage-cached)
- `useUserLocation` — browser geolocation, runs once at mount
- `useGeocode` — Nominatim fallback when DBKL coordinates are invalid

**External APIs:**
- `https://apihub.dbkl.gov.my/api/public/v1/location/getCategoryByLocation` — location list
- `https://apihub.dbkl.gov.my/api/public/v1/location/facility?sub_category=BADMINTON&location_id={id}&search_date={YYYY-MM-DD}` — court availability
- `https://apihub.dbkl.gov.my/api/public/v1/location?id={id}` — location coordinates
- `https://apihub.dbkl.gov.my/api/public/v1/parliment?id={id}` — parliament/constituency name
- `https://nominatim.openstreetmap.org/search` — geocoding fallback (rate-limited to ~1 req/sec)

**Component hierarchy:**
```
App.tsx (state)
├── FilterBar.tsx — date, location dropdown, consecutive slots, time range controls
└── TimelineView.tsx — court grid grouped by location, sorted by distance
    └── CourtRow.tsx → SlotCell.tsx (per time slot, color-coded availability)
```

**Key utilities in `src/utils/`:**
- `consecutiveSlots.ts` — `TIME_ORDER` array (8 AM → 12 AM) and `hasConsecutiveSlotsInRange()` for filtering courts by available consecutive hours within a time window
- `distance.ts` — Haversine formula with a 2× road correction factor; `isValidMalaysiaCoord()` for coordinate validation
- `geocoding.ts` — Nominatim integration for coordinate lookup by location name

**Caching strategy:** Location list is kept in module-level state (no re-fetch). Geocoding results are stored in localStorage. DBKL coordinates fetched per location and memoized during the session.

## Conventions

**Components & hooks:**
- Functional components only, named exports (not default) except `App.tsx`
- Custom hooks return `{ data, loading, error }` shaped objects consistently
- All hooks that call APIs use `useEffect` with a local `cancelled` boolean for cleanup (not `AbortController`) — this is intentional for React 19 StrictMode compatibility (see comment in `useAllFacilities.ts`)
- Hooks own their own interfaces inline — there is no shared types file. When adding new hooks, define interfaces in the same file

**Styling:**
- Tailwind CSS utility classes only — no custom CSS classes, no CSS modules
- Dark theme palette: `slate-700/800/900` backgrounds, `emerald-400/500` for positive states, `orange-500` for active filters, `red` for errors
- Card pattern: `bg-slate-800/60 border border-slate-700 rounded-2xl`
- Interactive buttons: `rounded-xl` with `shadow-lg shadow-{color}/30` when active
- Fonts: Outfit (headings via inline style), Inter (body via Tailwind default)

**Data flow:**
- No state management library — all state is `useState` in `App.tsx`, passed as props
- Filtering/sorting logic lives in `useMemo` hooks, not in event handlers
- API base URL is hardcoded (no env vars) — DBKL's public API has no auth
- Batch fetching uses `Promise.all` per batch of 10 with 200ms inter-batch delay to avoid hammering the API

**TypeScript:**
- Use `interface` (not `type`) for object shapes
- Prop interfaces are named `{ComponentName}Props`
- Hook return interfaces are named `Use{HookName}Return`

**Shared types** live in `src/types.ts` — `LocationFacility` and `LocationData` are defined there and imported by hooks and components. `LocationFacilityTime` remains in `src/utils/consecutiveSlots.ts` since it's tightly coupled with the time-ordering logic there.
