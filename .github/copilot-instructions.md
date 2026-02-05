<!-- .github/copilot-instructions.md -->
# Copilot / AI Agent Instructions — bokang-utica-hair-salon

Quick, focused guidance for an AI code agent working in this repo (React + TypeScript + Vite).

- Project type: React 19 + TypeScript + Vite (see [package.json](package.json)).
- Entry point: [src/main.tsx](src/main.tsx#L1) — app mounts `App` with `BrowserRouter`.
- High-level routing & auth: [src/App.tsx](src/App.tsx#L1) — role-based routes (admin/customer) using Firebase auth + Firestore users collection.
- Firebase integration: [src/firebase/config.ts](src/firebase/config.ts#L1) and [src/firebase/auth.ts](src/firebase/auth.ts#L1). Environment variables use Vite names (`VITE_*`) and are accessed via `import.meta.env`.
- UI layout: Pages live in [src/pages/](src/pages/) (Landing, Auth, Customer/Admin dashboards). Reusable UI lives in [src/components/](src/components/).
- Styling: Tailwind is configured + some component CSS under [src/styles/](src/styles/). Keep using Tailwind utility classes where present.

Developer workflows & commands
- Start dev server: `npm run dev` (runs `vite`).
- Build: `npm run build` (runs `tsc -b` then `vite build`) — note: TypeScript project references are used; keep `tsconfig.*.json` in mind.
- Preview production build: `npm run preview`.
- Lint: `npm run lint` (ESLint configured in `eslint.config.js`).
- Environment files: `.env`, `.env.local` exist in repo root. Never hardcode Firebase keys — use `VITE_FIREBASE_*` variables.

Project-specific patterns to follow (discoverable from code)
- Auth & roles: The app relies on Firebase Auth and a Firestore `users` document to determine `role` (`admin` | `customer`). See `onAuthStateChanged` in `src/App.tsx` and Firestore `getDoc(doc(db, 'users', uid))`.
- Firebase services: `src/firebase/config.ts` exports `auth`, `db`, `storage`. Use these exports instead of initializing Firebase again.
- Route protection: Routes check both `user` and `role` (example: `/admin/dashboard`). When adding pages/components, follow the same route-protection pattern.
- Component structure: Small presentational components sit in `src/components/`. Pages orchestrate data fetching and composition.
- File naming: `.tsx` for React components; keep PascalCase for components and pages (e.g., `AdminDashboard.tsx`, `HairstyleCard.tsx`).

Integration & external dependencies
- Firebase (auth, firestore, storage) — use `firebase` SDK imports (see `src/firebase/*`).
- React Router v6 — use `Routes`, `Route`, `Navigate` (see `src/App.tsx`).
- Tailwind CSS + PostCSS — styling via utility classes; configuration in `tailwind.config.js` and `postcss.config.js`.

When editing or adding code, prefer these concrete actions
- Use existing `src/firebase/*` exports for any Firebase work; add new Firestore reads/writes alongside existing patterns.
- When adding routes, update `src/App.tsx` to maintain the role checks and loading state.
- Keep TypeScript types light and consistent with existing usage (many files use `any` for `user`); match surrounding style rather than introducing heavy refactors.
- Add Vite env variables with `VITE_` prefix and document them in `README.md` or a new `.env.example` if you add more.

Files to inspect for context before changes
- [src/App.tsx](src/App.tsx#L1) — auth & routing
- [src/firebase/config.ts](src/firebase/config.ts#L1) — env usage
- [package.json](package.json) — scripts and deps
- [vite.config.ts](vite.config.ts) — plugin and build options
- [src/pages/](src/pages/) and [src/components/](src/components/) — common patterns

Examples
- To read current user role: follow pattern in `src/App.tsx` — `getDoc(doc(db, 'users', currentUser.uid))` and read `role` field.
- To add a protected admin route: replicate the `user && role === 'admin' ? <AdminDashboard /> : <Navigate to='/auth' />` pattern.

Do NOT
- Hardcode secrets or Firebase keys; always use `VITE_*` env values.
- Change global build scripts without validating `tsc -b` step (build relies on TypeScript project references).

If unclear, ask the repo owner these quick questions
- Do you want a `.env.example` with the required `VITE_FIREBASE_*` keys?
- Should new Firestore collections follow any naming convention beyond what's present?

End of instructions — update on request.
