# DEPLOY VERDICT — ShopKart audit

## 1) Verdict: runtime/env cause (no code bug explains the symptoms)

Single root-cause chain: backend `npm run dev` never reaches
`app.listen`, so nothing serves `http://localhost:5050`, and every
frontend symptom is downstream of that.

- `backend/index.js:43-47` calls `connectDB().then(()=>app.listen(PORT))`;
  the `ShopKart API listening on http://localhost:PORT` line (:45) prints
  ONLY after MongoDB connects. No localhost line = boot gated before listen.
- Gates that kill/hang before listen (`index.js:14-17`, `config/db.js:4-15`):
  missing `JWT_SECRET` → exit(1); missing `MONGO_URI` → exit(1);
  `mongoose.connect` reject (bad URI/auth/DB down/DNS) → exit(1);
  connect hang (blackholed host) → silent hang, no log, no exit.
- Frontend red `GET /customers/me` while logged out is EXPECTED, not a bug:
  route exists (`customer.routes.js:15`, mounted `/customers`), and `protect`
  (`auth.middleware.js:7-30`) returns 401 JSON for missing/bad token by design.
  `AuthContext` handles it (`setUser(null)`); interceptor skips `/customers/*`.
- Products "cannot reach backend / shows nothing" is the correct frontend
  error state for backend-down (`StateMessage` + Try Again), distinct from the
  empty-shelf state. URL stack matches: `api.js` default `http://localhost:5050`,
  no `/api` prefix on either side, CORS `credentials:true`, ports 5050/5180.

## 2) Minimal fix list — runtime steps only (no code edit fixes the outage)

1. `cd backend`; confirm `.env` has `JWT_SECRET`, `MONGO_URI` (plus `PORT`,
   `CLIENT_URL`, per `.env.example`). Never print values.
2. `npm run dev` (uses `dns-fix.cjs`; `npm start` does NOT). Expect in order:
   `MongoDB connected: <host>/shopkart_trinankur`, then
   `ShopKart API listening on http://localhost:5050`.
   - `MongoDB connection failed` / missing-env error → fix URI/secret/network.
   - Total silence → DB hang/DNS; check Atlas IP allowlist, connectivity.
3. `curl http://localhost:5050/` → `ShopKart API is running`.
4. `npm run seed` only if products empty (expect `Inserted 20 sample products`).
5. `cd frontend && npm run dev`; open `http://localhost:5180/` (localhost, not
   `127.0.0.1`, for cookies). Products loading = end-to-end OK.

## 3) Deploy order

MongoDB reachable → backend `npm run dev` (listen line) → `GET /` OK →
seed if empty → frontend dev on 5180 → verify products + logged-out `/me` 401.

## 4) Other findings ranked (none cause this outage)

- RED HERRING: red 401 on `/customers/me` logged-out — by design.
- RED HERRING: empty products shelf — correct empty state, not this symptom.
- REAL minor bug (robustness, fix later): `CartContext.jsx:78,82` derefs
  `item.product.price/_id` — null product (deleted item) throws app-wide.
- REAL minor bug: `Navbar.jsx:208` `user.fullName.split` without guard
  (`Account.jsx` guards; Navbar doesn't).
- REAL minor inconsistency: `getMyProfile` (`customer.controller.js:81-83`)
  returns bare object vs `{success,...}` envelope elsewhere.
- REAL minor bug: `POST /customers/logout` requires `protect`, so logged-out
  caller gets 401 and stale cookie persists.
- REAL edge bug: `changePassword` (`customer.controller.js:103-104`) derefs
  `customer.password` without null check → 500 if account deleted post-auth.
