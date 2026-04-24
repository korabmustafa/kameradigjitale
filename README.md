# Kamera Digjitale Frontend

Frontend-only ecommerce app for cameras and accessories, built with **React + TypeScript + TailwindCSS**.

## Features

- Playful and intuitive shopping UI.
- Navigation menu aligned to requested categories:
  - New
  - Film Cameras
  - Digital Cameras
  - Lenses
  - Film
  - Accessories
  - Supplies
  - Brands
  - Condition
  - VALOI
  - Info
  - Sell
- Product catalog with image-first cards.
- Category collection pages (`/catalog/*`) for camera types.
- Checkout page focused on **Payment on Delivery** (cash on delivery).
- Frontend-only **Admin Dashboard** with intuitive management modules:
  - Product management: create, view, delete
  - User management: create, activate/deactivate, delete
  - Order management: view all orders and update delivery status
- API-ready structure so future backend integration is straightforward.

## Routes

- `/` Home
- `/catalog` All products
- `/catalog/film-cameras`
- `/catalog/digital-cameras`
- `/catalog/lenses`
- `/catalog/film`
- `/catalog/accessories`
- `/catalog/supplies`
- `/brands`
- `/condition`
- `/valoi`
- `/sell`
- `/checkout`
- `/admin`
- `/info`

## Getting Started

```bash
npm install
npm run dev
```

## Can we deploy this first version?

Yes — as a **frontend-only MVP** this can be deployed after dependencies install successfully in your CI/CD or hosting environment.

Deployment checklist:

1. `npm ci` or `npm install` succeeds in deployment environment.
2. `npm run build` completes.
3. SPA rewrite is enabled on hosting (all routes redirect to `index.html`).
4. `VITE_API_BASE_URL` added once backend is ready.
5. Replace local state handlers in `src/App.tsx` with backend APIs.

## Backend Integration Plan (later)

Replace local state handlers in `src/App.tsx` with API calls to your backend project:

- `GET /products`
- `POST /products`
- `DELETE /products/:id`
- `POST /orders` (cash-on-delivery orders)

