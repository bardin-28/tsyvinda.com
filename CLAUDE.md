# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal website for Vladyslav Tsyvinda — single contacts page (LinkedIn, Telegram, Instagram) with an animated three.js hero, motion-driven intro, OG/meta, JSON-LD `Person` schema, and Google Analytics. Deployed at https://tsyvinda.com.

Stack: Next.js 16 (App Router) + React 19 + TypeScript, Tailwind is **not** used — styling is per-route CSS Modules (`page.module.css`) plus a single `globals.css`. Animations via `framer-motion`. 3D hero via `three` (raw `THREE.WebGLRenderer`, no `@react-three/fiber`). Unit tests: Jest 30 + `next/jest` + Testing Library, jsdom env. Component workshop: Storybook 10 with `@storybook/nextjs`.

## Commands

```bash
npm run dev              # next dev — http://localhost:3000
npm run build            # next build (incremental: tsconfig.tsbuildinfo)
npm run start            # serve the production build
npm run lint             # eslint (flat config, next/core-web-vitals + next/typescript)
npm test                 # jest --config config/jest.config.ts
npm run test:watch       # jest watch mode
npm run test:ci          # jest --ci --coverage (writes /coverage)
npm run storybook        # storybook dev on :6006, config dir config/storybook
npm run build-storybook  # static build → /storybook-static
```

File-name conventions are enforced by config, **not** convention alone:
- Tests: `src/**/*.test.{ts,tsx}` — anything else is invisible to Jest.
- Stories: `src/**/*.stories.@(ts|tsx|mdx)` — anything else is invisible to Storybook.

Tooling configuration lives under `config/`, not the repo root:
- `config/jest.config.ts` — wraps `next/jest`, `rootDir: ".."`, jsdom, CSS Modules mocked via `identity-obj-proxy`, `@/*` alias mirrored from `tsconfig.json`. The script `npm test` passes `--config config/jest.config.ts`; running bare `jest` will not find it.
- `config/jest.setup.ts` — imports `@testing-library/jest-dom`.
- `config/storybook/main.ts` + `preview.ts` — Storybook reads them via `-c config/storybook` flags in the npm scripts. There is **no** `.storybook/` directory; do not run `npx storybook init` without `--config-dir config/storybook` or it will create one.

Path alias: `@/*` → `./src/*` (set in `tsconfig.json`; mirrored in Jest `moduleNameMapper`).

## Architecture

All app code lives under `src/app/` (App Router). Key files:

- `src/app/layout.tsx` — root layout. Owns `<head>` metadata via the Next Metadata API (title, OG, Twitter, icons, robots, canonical, `metadataBase: https://tsyvinda.com`), the JSON-LD `Person` schema (injected as `<script type="application/ld+json">` inside `<head>`), and the GA bootstrap (loaded with `next/script` `strategy="afterInteractive"` and gated on `process.env.GA_ID`). Loads the Roboto font via `next/font/google` and exposes it as the `--font-roboto` CSS variable. Imports `./(home)/globals.css` as the only global stylesheet.
- `src/app/(home)/page.tsx` — the home page, inside a route group so the URL stays `/`. Client component (`"use client"`) because it uses `framer-motion` + a client-only three.js scene. The `CylinderScene` is `next/dynamic` with `ssr: false` — do **not** import it statically; SSR will break on `window`/WebGL.
- `src/app/(home)/CylinderScene/CylinderScene.tsx` — full-screen fixed-position three.js scene (`position: fixed; inset: 0; pointer-events: none`). Builds renderer/scene/camera + a stylised hat (cylinder + brim) with orbiting point lights, a particle halo, and mouse/touch parallax inside a single `useEffect`. The cleanup function disposes every geometry/material/renderer and removes all listeners — if you add a new geometry or material, add it to the disposal arrays at the bottom or you will leak GPU memory on route changes.
- `src/app/about/page.tsx` — client-component about page (bio, stack, experience timeline, education). Metadata lives in `src/app/about/layout.tsx` (server, exports `metadata`). Animation: `AboutScene` (`next/dynamic`, `ssr: false`) renders a fixed-position three.js scene with a wireframe icosahedron, dodecahedron shell, rings, and a particle nebula with mouse + scroll parallax. Same disposal pattern as `CylinderScene`.
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts` — Next file-based metadata routes. Sitemap lists `/` and `/about`. Manifest theme color is the brand orange `#fd7e14`.

Styling conventions:
- `(home)/globals.css` is the only global CSS. Everything else is CSS Modules colocated with the page (`page.module.css`).
- Brand colour is `#fd7e14` (orange). It appears in the manifest theme, the three.js materials, and the page module styles — change all three together.

Assets:
- `public/favicon/*` — multi-size favicons referenced from `layout.tsx` metadata icons.
- `public/images/avatar.jpg` — 88×88 hero avatar, rendered via `next/image` with `priority`.
- There is no `public/og.png` and no `app/opengraph-image.tsx`; OG currently relies on `metadata.openGraph` text only. Add an image route if you need a card preview.

## Environment

- `GA_ID` — Google Analytics measurement ID. If unset, the GA `<Script>` tags are skipped. Stored locally in `.env.local` / `.env.production` (gitignored).
- `next.config.ts` is empty (no custom config).

## Deployment

Containerised via the root `Dockerfile` (`node:lts`, `npm install`, `next build`, `npm start` on port 3000). `docker-compose.yml` runs the app behind `nginxproxy/nginx-proxy` + `acme-companion` for Let's Encrypt TLS; auxiliary nginx config lives under `docker/nginx-proxy/`. Compose expects these env vars: `NETWORKS_DRIVER`, `RESTART_POLICY`, `COMPOSE_PROJECT_NAME`, `FRONTEND_HOST`, `LETSENCRYPT_EMAIL`, `BASIC_AUTH*`.
