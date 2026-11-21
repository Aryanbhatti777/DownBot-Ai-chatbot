# Downbot

Downbot is an authentication-only full-stack foundation for an AI chat workspace. It includes a React + Vite frontend, Redux Toolkit auth state, and a JavaScript Express + MongoDB authentication API.

## Requirements

- Node.js 20+
- MongoDB

## Run locally

```sh
npm install
npm install --prefix backend
npm install --prefix frontend
Copy-Item backend/.env.example backend/.env
npm run dev
```

The Vite server runs on port `5173` and proxies `/api` requests to Express on port `5000`. Configure distinct long random values for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` in `backend/.env`.

The frontend is organized by feature in four layers: `api` for Axios calls, `state` for Redux slices, `hooks` for auth orchestration, and `ui` for pages/components.

The authentication pages are available at `/login` and `/register`.

See [backend/README.md](./backend/README.md) for endpoint details and API response examples.
