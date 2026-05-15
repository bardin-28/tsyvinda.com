# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal website for Vladyslav Tsyvinda — contacts page (LinkedIn, Telegram, Instagram) with animations, OG/meta, JSON-LD schema, Google Analytics.

Stack: Next.js (App Router), TypeScript, Tailwind CSS.

## Commands

```bash
npm run dev      # dev server at localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

## Architecture

App Router layout — all routes under `app/`. Root `layout.tsx` holds `<head>` metadata, GA script, and global providers. Home page at `app/page.tsx`.

Metadata exported from `app/layout.tsx` via Next.js Metadata API (not manual `<head>` tags). OG image at `public/og.png` or generated via `app/opengraph-image.tsx`.

JSON-LD schema injected as `<script type="application/ld+json">` in root layout.

GA tracked via `next/script` with `strategy="afterInteractive"` in root layout.
