# Palmery Front End (palmery-fe)

Aplikasi utama MySawit (pengiriman, payment desk, dll.) di **http://localhost:3001**.

Login/registrasi dilakukan di **palmery-auth** (http://localhost:3000), lalu dialihkan kembali dengan JWT.

## Setup

```bash
cp .env.sample .env.local
pnpm install
pnpm dev
```

## Stack lokal

Lihat panduan lengkap di [../palmery-manage/README.md](../palmery-manage/README.md).

| App | Port | Command |
|-----|------|---------|
| palmery-fe | 3001 | `pnpm dev` |
| palmery-auth UI | 3000 | `cd ../palmery-auth/frontend && pnpm dev` |
| palmery-auth API | 8080 | `cd ../palmery-auth/backend && ./gradlew bootRun` |
| palmery-manage | 8081 | `cd ../palmery-manage && ./gradlew bootRun --args='--spring.profiles.active=dev'` |

## Route protection

- `/supir/*` — hanya peran **SUPIR**
- `/mandor/*` — hanya peran **MANDOR**
- `/admin/*` (pengiriman) — hanya peran **ADMIN**

Tanpa login, akses dashboard dialihkan ke `/` dengan pesan login required.

## Debug

- `http://localhost:3001/debug`
