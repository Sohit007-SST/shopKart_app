# ShopKart BEST Plan — Eye-Catching Frontend Only

Identity: warm paper `#f6f1e8`, surface `#fffdf8`, ink `#2b2320`, terracotta `#c2563a` / dark `#a03f28` / soft `#fbeae5`, mustard `#d9a441`. Fraunces display + DM Sans body. No backend/API edits. No gradients/glass/emoji icons.

## Motion system (framer-motion only; transform/opacity only)

Install once: `cd frontend; npm i framer-motion`.
New `src/motion.jsx`: `fadeSlide` (y 14→0, 220ms ease-out), `staggerGrid` (children ≤12 × 40ms), `cardIn`, `useReveal()` IntersectionObserver fallback adding `.reveal-visible`, `MotionPrefersReduced` kill-switch. CSS in `index.css`: `fadeUp`, `scaleIn`, `shimmer` skeleton + `.reveal` + `@media (prefers-reduced-motion: reduce)` disabling all. Budgets: micro 100–250ms, page 220–350ms, buttons `whileTap={{scale:0.97}}`.

## Track A — motion tokens + shell (build gate 1)

1. Install framer-motion; add `src/motion.jsx`.
2. `App.jsx`: wrap Routes in `AnimatePresence mode="wait"`, `motion.main` keyed by pathname fadeSlide.
3. `index.css`: tokens + keyframes + skeleton + reduced-motion; keep radii 8/14/22, max-width 1160px.
4. `Navbar.jsx`: keep sticky ink header; add active-link underline slide + cart-count pop (`key=count` scaleIn); hamburger <820px unchanged.
Verify: `cd frontend; npm run build`.

## Track B — nav + home editorial (build gate 2)

1. `Home.jsx`: espresso full-bleed hero — eyebrow, kinetic Fraunces headline (staggered lines), `Welcome {fullName}`, dual CTAs (Start Shopping solid / Browse Ghost); editorial asymmetric band + 4 quick-link cards with hover image-swap/underline; ADD featured-products rail (horizontal scroll shelf, 8 items, quick-add on hover).
2. Footer: 3-line editorial (brand + Razorpay Test Mode + links), not single line.
Verify: `npm run build`.

## Track C — products + wishlist image-first (build gate 3)

1. `ProductCard.jsx`: image-first (200px, hover zoom/2nd-image swap), saved-heart pop, tag/category, Fraunces title, price + stock tone, View Details + Wishlist + AddToCart; grid uses `staggerGrid`, drawer-free.
2. Products page: skeleton shimmer cards while loading; empty-state editorial card.
3. Wishlist: same card + remove micro-interaction (scaleOut 180ms).
Verify: `npm run build`.

## Track D — cart drawer + checkout + account (build gate 4)

1. `Cart.jsx`: slide-in drawer (x 320→0, 280ms), overlay fade, qty stepper 150ms, cart-shake on add, subtotal count-up.
2. Checkout/orders/success: 3-step progress (160–220ms tab easing), button loading→success morph; toasts top-right 250ms.
3. Auth/account: input focus ring terracotta-soft, error shake 200ms once, welcome fadeSlide.
Verify: `npm run build` (final gate; `npm run preview` optional smoke).
