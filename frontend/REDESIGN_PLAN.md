# Pinterest-Inspired Frontend Overhaul Plan (FRONTEND ONLY)

Zero edits to backend/, backend .env, or API logic. All API call contracts identical (`changePassword` stays PATCH /customers/change-password).

## 1) Palette + Type + Tokens

Palette (warm, Pinterest 2025 earthy; no purple/blue gradient, no cream page bg):
- Clay Terracotta `#C2563A` (primary CTA/accents, replaces teal `#1d6b5c`)
- Deep Espresso `#2B2320` (ink/headings; page bg warm paper `#F6F1E8`, surface `#FFFDF8`)
- Sage/Dill `#6B7C4E` (success/secondary accents, badges)
- Warm neutrals: line `#E4DCCF`, muted `#71665A`; Mustard `#D9A441` sparingly (stars/eyebrow); danger `#B42318` unchanged
- Hero: solid espresso `#2B2320` with terracotta underline accent (no gradient); placeholders `#EFE6D8`

Type (distinctive pairing, not Inter-everywhere):
- Display: Fraunces (serif, headings/hero/price) + Body: DM Sans (UI/body). 2 fonts max via Google Fonts link in index.html.
- Tokens: `--font-display:"Fraunces",Georgia,serif; --font-body:"DM Sans",system-ui,sans-serif; --radius-sm:8px; --radius:14px cards; --radius-lg:22px hero/details-image/auth-card; --pill:999px; --shadow: restrained 1-layer (cards), none on hover; radii varied by component.`

Motion: no `hover:scale-105` on cards; hover = translateY(-2px) + shadow only; honor `@media (prefers-reduced-motion: reduce){ *{transition:none!important} }`.

## 2) Per-File Edit List

A — Tokens/global (`frontend/src/index.css`, `frontend/index.html`):
- `:root`: swap `--primary→#C2563A`, `--primary-dark→#A03F28`, `--primary-soft→#FBEAE5`, `--ink→#2B2320`, `--bg→#F6F1E8`, `--line→#E4DCCF`, add font/radius tokens above.
- `body`: font-body; headings/`.card-title`/`.price`/`.hero` use font-display. Fonts `<link>` Fraunces+DM Sans in index.html.

B — Layout/nav/footer (`frontend/src/components/Navbar.jsx`, `frontend/src/App.jsx`, `index.css` navbar/footer ~86-193, 1178-1184):
- Navbar: solid espresso bar, terracotta brand-mark; add `Account` NavLink; make `Hi, {first}` link to `/account`; keep 820px breakpoint.
- App.jsx: add `import Account` + `<Route path="/account">` inside ProtectedRoute; footer keeps `.footer` class, warm line color only.

C — Home/product/cards (`frontend/src/pages/Home.jsx` hero/grid ~76-135/554-611, `ProductCard.jsx`, `ProductDetails` CSS ~724-776, `SearchBar`, `WishlistCard`):
- Home: keep hero + quick-links only; editorial hero (serif headline, eyebrow, solid espresso); masonry-ish responsive grid for quick-links/cards.
- Cards: image-first, 14px radius, name+price+one trust signal (rating/stock tag), quick-add stays; remove scale hover; secondary-image hover optional.
- Details: split layout, 22px image radius, serif price.

D — Auth/profile/password-move (`frontend/src/pages/Home.jsx:8-63,88-110,135`, NEW `frontend/src/pages/Account.jsx`, `App.jsx`, `Navbar.jsx`; `api.js:38` untouched):
- New `Account.jsx`: move My Profile card + `ChangePasswordForm` verbatim (same `changePassword`, `getErrorMessage` imports, >=6-char + match validation).
- Home.jsx: delete `ChangePasswordForm` def/import/usage; remove password UI entirely.
- App.jsx route + Navbar link per section B. No API change.

## 3) Verify Steps

1. `cd frontend; npm run build` passes (frontend-only).
2. `git status --porcelain` / `git diff --stat` shows zero paths under `backend/`.
3. Manual: `/home` shows no password UI; `/account` shows profile + change-password (weak/mismatch errors, success alert); PATCH contract unchanged; reduced-motion + mobile 820px checked.
