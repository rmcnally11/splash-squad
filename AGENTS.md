# Splash Squad

Phone-first canvas platformer. Vite + TypeScript. Kids throw water balloons at evil surfer dudes.

This project is Vite, not Next.js. Ignore any leftover `next-env.d.ts`.

## Commands

- Install: `npm ci`
- Dev server: `npm run dev` on `http://127.0.0.1:43173`
- Production build: `npm run build` (output `dist`)

## GitHub

Canonical repo: https://github.com/rmcnally11/splash-squad

Remote name is `github`. `GITHUB_TOKEN` is an environment secret (fine-grained PAT with Contents read/write). Use it to push. Never print it or commit it.

```bash
git push "https://x-access-token:${GITHUB_TOKEN}@github.com/rmcnally11/splash-squad.git" HEAD
```
