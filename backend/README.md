# Downbot authentication API

## Setup

Use Node.js 20 or newer. Copy `.env.example` to `.env`, set distinct strong token secrets, and make MongoDB available at `MONGO_URI`.

```sh
npm install
npm run dev
```

The API listens on port `5000` by default. Success responses use `{ "success": true, "message": "...", "data": {} }`; failures use `{ "success": false, "message": "...", "errors": [] }`.

## Endpoints

All routes are under `/api/v1/auth`. The refresh token is stored in an HTTP-only cookie; the access token is returned in `data.accessToken`.

| Method | Path | Request | Success response data |
| --- | --- | --- | --- |
| POST | `/register` | `{ "name": "Ari", "email": "ari@example.com", "password": "secure123" }` | `{ "accessToken": "...", "user": { "id": "...", "name": "Ari", "email": "ari@example.com" } }` |
| POST | `/login` | `{ "email": "ari@example.com", "password": "secure123" }` | `{ "accessToken": "...", "user": { "id": "...", "name": "Ari", "email": "ari@example.com" } }` |
| POST | `/refresh` | Refresh cookie | `{ "accessToken": "...", "user": { "id": "...", "name": "Ari", "email": "ari@example.com" } }` |
| POST | `/logout` | Refresh cookie, if present | `{}` |
| GET | `/me` | `Authorization: Bearer <access-token>` | `{ "user": { "id": "...", "name": "Ari", "email": "ari@example.com" } }` |

Example success envelope:

```json
{ "success": true, "message": "Login successful", "data": { "accessToken": "...", "user": { "id": "...", "name": "Ari", "email": "ari@example.com" } } }
```

Example validation error:

```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "Enter a valid email address" }] }
```

## Frontend proxy

Vite proxies `/api` requests to the backend without enabling CORS:

```js
server: {
  proxy: {
    "/api": { target: "http://localhost:5000", changeOrigin: true }
  }
}
```
