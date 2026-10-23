# Midnight Focus

Make time for what matters. Midnight Focus is a focus timer and learning tracker: run Pomodoro-style sessions against your learning tasks, and see how your time adds up.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui and Lucide icons.

## Features

- **Focus timer**: focus, short break and long break modes with configurable durations. It is deadline-based, so it stays accurate in background tabs.
- **Learning tasks**: create, edit, delete and complete tasks. Pick one for the focus timer, and sessions count toward its estimate.
- **History**: today's focus time, a seven-day chart against your daily goal, and recent sessions.
- **Settings**: durations, daily goal, auto-start, completion sound and notifications, and reduced motion.
- **Keyboard**: `Space` start or pause, `R` reset, `N` skip. Shortcuts are ignored while you type.

All data is stored in your browser's localStorage. Nothing is synced or backed up, and clearing site data removes it.

## Getting started

```bash
pnpm install
pnpm dev       # http://localhost:3000
```

## Scripts

| Command      | What it does                                             |
| ------------ | -------------------------------------------------------- |
| `pnpm dev`   | Start the development server                             |
| `pnpm build` | Production build (type-checks and prerenders every page) |
| `pnpm start` | Serve the production build                               |
| `pnpm lint`  | Run ESLint                                               |
| `pnpm test`  | Run the timer, reducer, storage and statistics tests     |

## Project structure

- `src/state/`: the app reducer (pure, tested) and the provider that loads and saves state, drives completion, and plays the chime.
- `src/lib/`: timer math, statistics, formatting, validated storage, and sound.
- `src/components/focus/`: the focus screen, timer ring and controls.
- `src/components/tasks/`, `history/`, `settings/`, `layout/`: one folder per page area.
- `src/components/ui/`: shadcn/ui primitives, restyled through the tokens in `src/app/globals.css`.
