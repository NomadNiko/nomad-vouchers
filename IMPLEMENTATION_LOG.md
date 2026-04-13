# Multi-Tenant Implementation Progress

## Phase 1: Server — New Tenant Infrastructure ✅
- **Status**: COMPLETE
- **Completed**: 2026-04-12

### What was done
- [x] Added `superAdmin = 4` to `RoleEnum` (server + frontend)
- [x] Created `Tenant` module: domain, schema, DTO, repository, service, controller
- [x] Created `UserTenantAccess` module: domain, schema, DTO, repository, service, controller
- [x] Added `tenantId` field to: GiftCard, GiftCardTemplate, Widget, Settings (schemas + domain classes + mappers)
- [x] Registered both new modules in `AppModule`
- [x] Created `TenantMiddleware` — extracts `x-tenant-id` header → `request.tenantId`
- [x] Created `TenantGuard` — validates user has access to the tenant (superAdmins bypass)
- [x] Updated `RolesGuard` — superAdmins bypass all role checks; uses tenant-scoped role when available

### Files created (server)
- `src/tenants/` — full module (domain, dto, infrastructure, service, controller)
- `src/user-tenant-access/` — full module
- `src/tenants/tenant.middleware.ts`
- `src/tenants/tenant.guard.ts`
- `src/database/seeds/document/tenant/` — seed service + module

### Files modified (server)
- `src/roles/roles.enum.ts` — added superAdmin
- `src/roles/roles.guard.ts` — rewritten for tenant-aware role checks
- `src/app.module.ts` — added modules, middleware, NestModule interface
- All domain classes — added tenantId
- All schemas — added tenantId with index
- All mappers — added tenantId mapping
- All abstract repositories — added tenantId to query signatures
- All document repositories — filter by tenantId
- All services — accept tenantId parameter
- All controllers — extract tenantId from request, use TenantGuard
- `src/auth/auth.service.ts` — returns tenants[] in login/me responses
- `src/auth/auth.module.ts` — imports tenant modules
- `src/auth/dto/login-response.dto.ts` — added tenants field
- `src/stripe/stripe.service.ts` — accepts tenantId
- `src/squarespace/squarespace.service.ts` — polls per-tenant
- `src/settings/settings.service.ts` — all methods take tenantId
- `src/settings/settings.controller.ts` — uses tenantId from query/request
- Seed files — run tenant migration

---

## Phase 3: Frontend — Auth & Tenant Context ✅
- **Status**: COMPLETE

### What was done
- [x] Created `TenantAccess` and `Tenant` types
- [x] Added `tenants?: TenantAccess[]` to `User` type
- [x] Created `TenantContext` + `TenantProvider` — manages current tenant, persists to localStorage
- [x] Updated `useFetch` — injects `x-tenant-id` header on all requests
- [x] Updated layout — wrapped with `TenantProvider` between `AuthProvider` and `CurrencyProvider`
- [x] Updated `CurrencyProvider` — fetches settings with tenantId query param

### Files created (frontend)
- `src/services/api/types/tenant.ts`
- `src/services/tenant/tenant-context.ts`
- `src/services/tenant/tenant-provider.tsx`

### Files modified (frontend)
- `src/services/api/types/role.ts` — added SUPER_ADMIN
- `src/services/api/types/user.ts` — added tenants field
- `src/services/api/use-fetch.ts` — injects x-tenant-id header
- `src/services/currency/currency-provider.tsx` — tenant-aware
- `src/app/[language]/layout.tsx` — added TenantProvider

---

## Phase 4: Frontend — Tenant Switcher & No-Access Page ✅
- **Status**: COMPLETE

### What was done
- [x] Created `TenantSwitcher` component — dropdown in app bar
- [x] Updated `app-bar.tsx` — added TenantSwitcher, Vendor Admin link, tenant-scoped role checks
- [x] Created `/no-access` page
- [x] Updated `withPageRequiredAuth` — handles no-access redirect, superAdmin bypass, tenant-scoped roles

### Files created
- `src/components/tenant-switcher.tsx`
- `src/app/[language]/no-access/page.tsx`

### Files modified
- `src/components/app-bar.tsx`
- `src/services/auth/with-page-required-auth.tsx`

---

## Phase 5: Frontend — Vendor Admin Page ✅
- **Status**: COMPLETE

### What was done
- [x] Created tenant API services (CRUD)
- [x] Created user-tenant-access API services
- [x] Created Vendor Admin list page (table of all clients)
- [x] Created Create Client page (name + slug form)
- [x] Created Edit Client page (edit details + manage user access)

### Files created
- `src/services/api/services/tenants.ts`
- `src/services/api/services/user-tenant-access.ts`
- `src/app/[language]/admin-panel/vendor-admin/page.tsx`
- `src/app/[language]/admin-panel/vendor-admin/page-content.tsx`
- `src/app/[language]/admin-panel/vendor-admin/create/page.tsx`
- `src/app/[language]/admin-panel/vendor-admin/create/page-content.tsx`
- `src/app/[language]/admin-panel/vendor-admin/[id]/edit/page.tsx`
- `src/app/[language]/admin-panel/vendor-admin/[id]/edit/page-content.tsx`

---

## Build Status
- **Server**: ✅ `tsc --noEmit` passes with 0 errors
- **Frontend**: ✅ `tsc --noEmit` passes with 0 errors

---

## Remaining Work

### Phase 6: Update Existing Frontend Pages for Tenant Context ✅
- [x] Added `tenantId` to frontend types: Widget, GiftCard, GiftCardTemplate
- [x] Updated widget page — fetches payment config with tenantId from widget
- [x] Updated `notifyPurchase` service — accepts tenantId parameter
- [x] Updated `getPublicPaymentConfig` service — accepts tenantId parameter

### Files modified (Phase 6)
- `src/services/api/types/widget.ts` — added tenantId
- `src/services/api/types/gift-card.ts` — added tenantId
- `src/services/api/types/gift-card-template.ts` — added tenantId
- `src/services/api/services/settings.ts` — tenantId param on payment config
- `src/services/api/services/gift-cards.ts` — tenantId param on notifyPurchase
- `src/app/widget/[apiKey]/page-content.tsx` — passes tenantId through

---

## Phase 7: Data Migration ✅
- **Status**: COMPLETE
- **Completed**: 2026-04-12T20:40

### Seed output:
- Created default tenant: `69dc033e0be47353f23ece60`
- Backfilled 1 settings document
- Created tenant access for `admin@example.com` (admin)
- Created tenant access for `john.doe@example.com` (user)
- `admin@example.com` promoted to superAdmin (role 4)

---

## Phase 8: Build & Deploy ✅
- **Status**: COMPLETE
- **Completed**: 2026-04-12T20:41

### Verified:
- Server: `npm run build` ✅, `pm2 restart gift-cards-dev-server` ✅
- Frontend: `npm run build` ✅, `pm2 restart gift-cards-dev` ✅
- Both processes online and stable

### API smoke tests:
- `POST /auth/email/login` → returns `role.id: "4"` (superAdmin) + `tenants[]` ✅
- `GET /auth/me` → returns user with `tenants[]` ✅
- `GET /tenants` → returns Default tenant ✅
- `GET /settings?tenantId=...` → returns tenant-scoped settings with `tenantId` ✅
- `GET /users` with `x-tenant-id` header → returns only users in that tenant ✅

---

## Phase 9: Translations & Tenant-Scoped Users Page ✅
- **Status**: COMPLETE
- **Completed**: 2026-04-12T20:55

### Translation files updated:
- `common.json` — Added navigation keys: checkBalance, manage, redeem, generate, purchases, admin, templates, widgets, settings, docs, vendorAdmin. Added noAccess section.
- `admin-panel-roles.json` — Added role `"4": "Super Admin"`
- `admin-panel-users.json` — Added role filter option `"4": "Super Admin"`
- `admin-panel-users-edit.json` — Added role option `"4": "Super Admin"`
- `admin-panel-users-create.json` — Added role option `"4": "Super Admin"`
- `vendor-admin.json` — New file with all vendor admin page translations

### Hardcoded strings replaced with i18n keys:
- `app-bar.tsx` — All mobile and desktop nav items now use `t("common:navigation.*")`
- `no-access/page.tsx` — Uses `t("common:noAccess.*")`
- All vendor admin pages — Use `t("vendor-admin:*")`

### Tenant-scoped Users page:
- **Server**: `UsersController` now uses `TenantGuard` + `RolesGuard`. When a tenant admin calls `GET /users` with `x-tenant-id`, the controller fetches UserTenantAccess records for that tenant and filters users by those IDs. SuperAdmins see all users.
- **Server**: `UserRepository.findManyWithPagination` accepts optional `userIds` filter, adds `{ _id: { $in: userIds } }` to the MongoDB query.
- **Server**: `UsersModule` imports `UserTenantAccessModule` and provides `TenantGuard`.
- **Frontend**: Users page already uses `withPageRequiredAuth({ roles: [RoleEnum.ADMIN] })` which allows tenant admins (their tenant role "admin" maps to RoleEnum.ADMIN).
