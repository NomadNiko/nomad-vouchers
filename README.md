# The Hurstwood — Gift Card Management System (Frontend)

A Next.js web application for managing restaurant gift cards. Provides an admin console for template creation, purchase tracking, and redemption, plus public-facing pages for customers to view and check balances on their gift cards.

**Live Demo**: <https://gift-cards.nomadsoft.us>

**Backend Repository**: `/var/www/gift-cards-server/`

## Features

### Admin Console
- **Template Management** — Create and edit gift card templates with custom images, drag-to-position code overlay, configurable QR code placement, font size/color/alignment controls, customizable code prefix, optional expiration dates, and partial or full redemption modes
- **Purchase Tracking** — Sortable table of all gift card purchases with code, amount, balance, purchaser info, status, and direct View/Redeem buttons. Responsive mobile card layout with sort dropdown
- **Redemption Console** — Look up gift cards by code, redeem full or partial amounts with audit trail
- **Widget Management** — Create embeddable purchase widgets with custom primary colors and auto-generated API keys
- **Settings** — Configure currency (GBP/EUR/USD), default redemption type, and notification email list
- **User Management** — Standard user CRUD from the boilerplate

### Public Pages
- **Gift Card View** — Displays the gift card with template image, code overlay, expiration label, QR code, amount, balance, and print support
- **Balance Lookup** — Search by code or email, supports auto-lookup via `?code=` URL parameter
- **QR Redirect** — Scanned QR codes route admins to the Redeem page and everyone else to the Balance page

### Navigation
Three dropdown menus in the nav bar:
- **Card Status** — Check Balance, Redeem (admin only)
- **Manage** — Templates, Purchases, Widgets (admin only)
- **Admin** — Settings, Users (admin only)

## Tech Stack

- Next.js 15 (App Router)
- React 19, TypeScript
- Material UI with dark mode support
- React Hook Form + Yup validation
- React Query for data fetching
- i18next for internationalization
- qrcode.react for QR code rendering

## Getting Started

```bash
cp example.env.local .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Key variables in `.env.local`:
- `NEXT_PUBLIC_API_URL` — Backend API URL (e.g. `https://gift-cards-server.nomadsoft.us/api`)

## Currency System

Currency is configured via the Settings page (GBP default). A `CurrencyProvider` context fetches the setting from the API and provides `{ symbol, code }` to all pages via the `useCurrency()` hook. Date formats adapt to currency: DD/MM/YYYY for GBP/EUR, MM/DD/YYYY for USD.

## Deployment

The app runs under PM2 as `gift-cards` (id 31).

```bash
npx prettier --write <changed files>
npm run build
pm2 restart gift-cards
```
