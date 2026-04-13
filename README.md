# Gift Card Management System (Frontend)

A multi-tenant Next.js web application for managing restaurant gift cards. A single deployment serves multiple clients (tenants), each with isolated templates, purchases, widgets, and settings. Super admins provision new clients; tenant admins manage their own gift card operations.

**Live Demo**: <https://gift-cards-dev.nomadsoft.us>

**Backend Repository**: `/var/www/gift-cards-dev-server/`

## Multi-Tenant Architecture

- **Super Admin** role provisions and manages client tenants via the Vendor Admin page
- **Tenant Switcher** in the top navigation bar for users with access to multiple clients
- Per-tenant data isolation — templates, gift cards, widgets, settings, and users are all scoped to the active tenant
- Users with no tenant access see a "Please contact your organisation" page
- Tenant admins can manage users within their own tenant
- All API requests include an `x-tenant-id` header injected automatically by the `useFetch` hook

## Features

### Vendor Admin (Super Admin Only)
- Create, edit, activate/deactivate client tenants
- Manage user access per tenant with role assignment (admin/staff/user)
- View all users across all tenants with tenant membership chips in the Users table

### Admin Console (Per-Tenant)
- **Template Management** — Create and edit gift card templates with custom images, drag-to-position code overlay, configurable QR code placement, font size/color/alignment controls, customizable code prefix, optional expiration dates, and partial or full redemption modes
- **Purchase Tracking** — Sortable table of all gift card purchases with code, amount, balance, purchaser info, status, and direct View/Redeem buttons
- **Redemption Console** — Look up gift cards by code, redeem full or partial amounts with audit trail
- **Widget Management** — Create embeddable purchase widgets with custom primary colors and auto-generated API keys
- **Settings** — Per-tenant currency (GBP/EUR/USD), payment gateway (Stripe/Squarespace), notification email list
- **User Management** — Tenant admins see only users in their tenant; super admins see all users with a Tenants column

### Public Pages
- **Gift Card View** — Displays the gift card with template image, code overlay, expiration label, QR code, amount, balance, and print support
- **Balance Lookup** — Search by code or email, supports auto-lookup via `?code=` URL parameter
- **QR Redirect** — Scanned QR codes route admins to the Redeem page and everyone else to the Balance page

### Roles

| Role | ID | Scope | Access |
|---|---|---|---|
| Super Admin | 4 | Global | All tenants, Vendor Admin, all features |
| Admin | 1 | Per-tenant | Full access within assigned tenant(s) |
| Staff | 3 | Per-tenant | Redeem, generate, view purchases |
| User | 2 | — | Public pages only |

### Navigation
- **Check Balance** — Public
- **Manage** dropdown — Redeem, Generate, Purchases (admin/staff)
- **Admin** dropdown — Templates, Widgets, Settings, Users (admin)
- **Vendor Admin** — Super admin only
- **Docs** — Admin/staff
- **Tenant Switcher** — Top right, shows current tenant name with dropdown to switch

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
- `NEXT_PUBLIC_API_URL` — Backend API URL (e.g. `https://gift-cards-dev-server.nomadsoft.us/api`)

## Tenant Context System

Tenant context is managed through several layers:

1. **`TenantProvider`** — Wraps the app (inside `AuthProvider`). Reads the user's `tenants[]` array from the `/auth/me` response. Manages current tenant selection.
2. **localStorage** — Current tenant ID persisted across page refreshes via `currentTenantId` key.
3. **`useFetch` hook** — Injects `x-tenant-id` header on every API request from the stored tenant ID.
4. **`CurrencyProvider`** — Fetches per-tenant settings (currency symbol/code) when tenant changes.
5. **`withPageRequiredAuth` HOC** — Checks tenant-scoped roles (not global roles) and redirects users with no tenant access to `/no-access`.
6. **`TenantSwitcher` component** — Dropdown in the app bar. Shows tenant name; if user has multiple tenants, allows switching. Reloads the page on switch.

## Currency System

Currency is configured per-tenant via the Settings page (GBP default). The `CurrencyProvider` context fetches the setting from the API using the current tenant ID and provides `{ symbol, code }` to all pages via the `useCurrency()` hook. Date formats adapt to currency: DD/MM/YYYY for GBP/EUR, MM/DD/YYYY for USD.

## Deployment

The app runs under PM2 as `gift-cards-dev` (id 40).

```bash
npx prettier --write <changed files>
npm run build
pm2 restart gift-cards-dev
```
