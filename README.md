# Ecosera (Curated SME Catalog)

Stack: **Vite + React + TypeScript + Tailwind + React Router + Vercel**

## Quick start
```bash
npm ci
cp .env.example .env   # set VITE_SHOP_WA to your WhatsApp number (62...)
npm run dev
```

## Build & Deploy
- `npm run build` → Vite static build
- Deploy on **Vercel** (connect repo).

## Structure
```
src/
  components/         # UI blocks
  context/            # Cart & Toast providers
  data/               # products.json + categories.json
  pages/              # Home / Etalase / ProductDetail / Cart
  services/           # data access (swap JSON -> API later)
  types/              # TypeScript types
  utils/              # money, env
```

## Routes
- `/` → Home
- `/Etalase` → All products
- `/product/:id` → Product detail
- `/cart` → Cart
```

## Notes
- Tailwind is preconfigured.
- Design language: soft gray background `#F6F8FC`, primary **blue** buttons (`bg-blue-600`).
- Update product data in `src/data/products.json`.
