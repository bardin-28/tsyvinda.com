# Technology Stack

**Analysis Date:** 2026-06-02

## Languages

**Primary:**
- TypeScript 5.x - All application code under `src/` and `config/`
- TSX - React components throughout `src/app/` and `src/shared/`

**Secondary:**
- JavaScript (ESM) - `eslint.config.mjs` only

## Runtime

**Environment:**
- Node.js LTS (v24.15.0 active in dev environment; Dockerfile uses `node:lts`)

**Package Manager:**
- npm 11.12.1
- Lockfile: `package-lock.json` present and committed

## Frameworks

**Core:**
- Next.js 16.2.3 - App Router, SSR/SSG, file-based routing, API rewrites, `next/og`, `next/font/google`, `next/image`, `next/dynamic`
- React 19.2.4 - UI rendering; hooks only (no class components)

**UI Primitives:**
- antd 6.4.3 - Dark theme via `ConfigProvider`; used for `Input`, `Button`, `ColorPicker`. Configured in `src/shared/providers/AntdProvider.tsx`

**Animation:**
- framer-motion 12.38.0 - `motion`, `AnimatePresence`, `useReducedMotion`; used in scene and shared components

**3D Rendering:**
- three 0.184.0 - Raw `THREE.WebGLRenderer` (no `@react-three/fiber`); used in `CylinderScene` and `AboutScene`

**Forms:**
- formik 2.4.9 - Form state; used in `LoginForm`
- zod 4.4.3 - Schema validation for form inputs

**Testing:**
- jest 30.4.2 - Test runner; config at `config/jest.config.ts`
- jest-environment-jsdom 30.4.1 - Browser-like DOM environment
- @testing-library/react 16.3.2 - Component rendering helpers
- @testing-library/user-event 14.6.1 - User interaction simulation
- @testing-library/jest-dom 6.9.1 - Custom DOM matchers; imported in `config/jest.setup.ts`

**Component Workshop:**
- storybook 10.4.0 - Component browser; config at `config/storybook/`
- @storybook/nextjs 10.4.0 - Next.js adapter

**Build/Dev:**
- eslint 9.x - Flat config at `eslint.config.mjs`; rulesets: `next/core-web-vitals` + `next/typescript`
- ts-node 10.9.2 - Runs `config/jest.config.ts` directly

## Key Dependencies

**Critical:**
- `next` 16.2.3 - Core framework; `proxy.ts` uses Next.js 16 renamed middleware convention
- `antd` 6.4.3 - UI component library; dark algorithm + brand token configured globally
- `three` 0.184.0 - 3D scenes; GPU resource disposal is mandatory (see `CylinderScene.tsx`, `AboutScene.tsx`)
- `framer-motion` 12.38.0 - Used for page animations and motion-aware transitions
- `zod` 4.4.3 - Validates login form schema in `src/app/login/components/LoginForm/validation/schema.ts`

**Infrastructure:**
- `identity-obj-proxy` 3.0.0 - Stubs CSS Modules in Jest (mapped in `moduleNameMapper`)
- `eslint-config-next` 16.2.3 - ESLint ruleset pinned to match Next version

## Configuration

**Environment:**
- Configured via environment variables; `.env.example` is committed, `.env.local` and `.env.production` are gitignored
- Required variables: `API_URL` (backend origin, default `http://localhost:4000`), `GA_ID` (Google Analytics ID, optional)
- `API_URL` is a build-time `ARG` in `Dockerfile` and a runtime env var in `docker-compose.yml`

**Build:**
- `next.config.ts` - Next.js config; image remote patterns, API + uploads rewrites
- `tsconfig.json` - TypeScript; `strict: true`, `incremental: true`, path alias `@/*` → `./src/*`
- `config/jest.config.ts` - Jest config; rootDir is repo root, testMatch `src/**/*.test.{ts,tsx}`
- `config/storybook/main.ts` - Storybook config; stories glob `src/**/*.stories.@(ts|tsx|mdx)`
- `eslint.config.mjs` - ESLint flat config

## Platform Requirements

**Development:**
- Node.js LTS; npm 11+
- HTTPS local dev requires `./certs/local.tsyvinda.com{,-key}.pem` for `npm run dev:https` (needed for auth cookie testing on `local.tsyvinda.com`)
- `NODE_OPTIONS='--max-old-space-size=4096'` set for `dev`, `build`, and `storybook` scripts

**Production:**
- Docker container (`node:lts`); built with `npm ci && npm run build`; served with `npm start` on port 3000
- Nginx reverse proxy (`nginxproxy/nginx-proxy`) + Let's Encrypt TLS (`nginxproxy/acme-companion`) via `docker-compose.yml`

---

*Stack analysis: 2026-06-02*
