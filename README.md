# Palmery Front End

This is a Next.js project

## Getting Started

To run the development server:

```bash
pnpm dev
```
It should run on localhost:3001

## Debug Integration Page

Copy `.env.sample` to `.env.local` if you want to override backend URLs:

```bash
cp .env.sample .env.local
```

The debug UI is available at:

- `http://localhost:3001/debug`

Default backend targets:

- `palmery-manage`: `http://localhost:8081`
- `palmery-payment`: `http://localhost:8082`
