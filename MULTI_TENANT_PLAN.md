# Multi-Tenant Conversion — Detailed Implementation Plan

## Overview

Convert the gift card system from single-tenant (one frontend + one server per client) to multi-tenant (single frontend + single server serving all clients). Introduce a "super-admin" role that can provision and manage tenants (clients), and a tenant switcher for regular users.

---

## Phase 1: Server — New Tenant Infrastructure

### 1.1 Add `superAdmin` Role
- **File**: `src/roles/roles.enum.ts`
- Add `'superAdmin' = 4` to `RoleEnum`
- **File**: `src/database/seeds/document/user/user-seed.service.ts`
- Change the seed admin user's role from `admin` (1) to `superAdmin` (4)

### 1.2 Create Tenant Module
New files:
- `src/tenants/domain/tenant.ts` — Domain class: `{ id, name, slug, isActive, createdAt, updatedAt }`
- `src/tenants/dto/create-tenant.dto.ts` — `{ name, slug }`
- `src/tenants/dto/update-tenant.dto.ts` — `Partial<CreateTenantDto> & { isActive? }`
- `src/tenants/dto/query-tenant.dto.ts` — Pagination + sort
- `src/tenants/infrastructure/persistence/document/entities/tenant.schema.ts` — Mongoose schema with unique `slug` index
- `src/tenants/infrastructure/persistence/document/repositories/tenant.repository.ts`
- `src/tenants/infrastructure/persistence/document/document-persistence.module.ts`
- `src/tenants/infrastructure/persistence/tenant.repository.ts` — Abstract repository
- `src/tenants/infrastructure/persistence/document/mappers/tenant.mapper.ts`
- `src/tenants/tenants.service.ts` — CRUD + `findBySlug()`
- `src/tenants/tenants.controller.ts` — SuperAdmin-only CRUD endpoints
- `src/tenants/tenants.module.ts`
- Register in `app.module.ts`

### 1.3 Create UserTenantAccess Module
This maps which users have access to which tenants, and their role within that tenant.

New files:
- `src/user-tenant-access/domain/user-tenant-access.ts` — `{ id, userId, tenantId, role (admin|staff|user), createdAt }`
- `src/user-tenant-access/dto/create-user-tenant-access.dto.ts` — `{ userId, tenantId, role }`
- `src/user-tenant-access/dto/update-user-tenant-access.dto.ts`
- `src/user-tenant-access/infrastructure/persistence/document/entities/user-tenant-access.schema.ts` — Compound index on `(userId, tenantId)` unique
- `src/user-tenant-access/infrastructure/persistence/document/repositories/user-tenant-access.repository.ts` — Methods: `findByUserId()`, `findByTenantId()`, `findByUserAndTenant()`, `create()`, `remove()`
- `src/user-tenant-access/infrastructure/persistence/document/document-persistence.module.ts`
- `src/user-tenant-access/infrastructure/persistence/user-tenant-access.repository.ts` — Abstract
- `src/user-tenant-access/infrastructure/persistence/document/mappers/user-tenant-access.mapper.ts`
- `src/user-tenant-access/user-tenant-access.service.ts`
- `src/user-tenant-access/user-tenant-access.controller.ts` — Endpoints for managing access (SuperAdmin + tenant admins)
- `src/user-tenant-access/user-tenant-access.module.ts`
- Register in `app.module.ts`

### 1.4 Add `tenantId` to Existing Schemas
Add `@Prop({ index: true }) tenantId: string` to:
- `GiftCardSchemaClass` (`src/gift-cards/infrastructure/persistence/document/entities/gift-card.schema.ts`)
- `GiftCardTemplateSchemaClass` (`src/gift-card-templates/infrastructure/persistence/document/entities/gift-card-template.schema.ts`)
- `WidgetSchemaClass` (`src/widgets/infrastructure/persistence/document/entities/widget.schema.ts`)
- `SettingsSchemaClass` (`src/settings/infrastructure/persistence/document/entities/settings.schema.ts`)

Add `tenantId` to corresponding domain classes:
- `GiftCard` (`src/gift-cards/domain/gift-card.ts`)
- `GiftCardTemplate` (`src/gift-card-templates/domain/gift-card-template.ts`)
- `Widget` (`src/widgets/domain/widget.ts`)
- `Settings` (`src/settings/domain/settings.ts`)

Update mappers to include `tenantId` in `toPersistence()` and `toDomain()`:
- `src/gift-cards/infrastructure/persistence/document/mappers/gift-card.mapper.ts`
- `src/gift-card-templates/infrastructure/persistence/document/mappers/gift-card-template.mapper.ts`
- `src/widgets/infrastructure/persistence/document/mappers/widget.mapper.ts`
- `src/settings/infrastructure/persistence/document/repositories/settings.repository.ts` (inline mapper)

---

## Phase 2: Server — Tenant-Scoped Queries & Auth

### 2.1 Tenant Context Extraction
- **New file**: `src/tenants/tenant.decorator.ts` — `@TenantId()` parameter decorator that extracts `tenantId` from `request.user`
- **New file**: `src/tenants/tenant.guard.ts` — Guard that validates the user has access to the `tenantId` in their JWT. For superAdmins, always passes. For others, checks UserTenantAccess.

### 2.2 Update Auth Flow
- **File**: `src/auth/auth.service.ts`
  - `validateLogin()`: After login, fetch user's tenant access list. Include in response. Set default `tenantId` (first accessible tenant, or null if none).
  - `getTokensData()`: Add `tenantId` to JWT payload
  - New method: `switchTenant(userId, newTenantId)` — Validates access, issues new tokens with new tenantId
  - `me()`: Return user with `tenants` array (list of `{ tenantId, tenantName, tenantSlug, role }`)
- **File**: `src/auth/auth.controller.ts`
  - New endpoint: `POST /auth/switch-tenant` — Body: `{ tenantId }`, returns new tokens
  - Update `me()` response to include tenant list
- **File**: `src/auth/strategies/types/jwt-payload.type.ts`
  - Add `tenantId?: string` to `JwtPayloadType`
- **File**: `src/auth/dto/login-response.dto.ts`
  - Add `tenants` array to response

### 2.3 Update RolesGuard
- **File**: `src/roles/roles.guard.ts`
  - For superAdmin (role 4): Always allow access to admin/staff endpoints
  - For others: Check the user's role within the current tenant (from UserTenantAccess), not just their global role
  - This is the most critical change — the guard needs to resolve the user's effective role for the current tenant

### 2.4 Update All Repositories to Filter by tenantId
Each repository's query methods need a `tenantId` parameter:

**Gift Cards** (`src/gift-cards/infrastructure/persistence/document/repositories/gift-card.repository.ts`):
- `findManyWithPagination()` — add `tenantId` filter
- `findById()` — add `tenantId` filter (or verify after fetch)
- `findByCode()` — code is globally unique, but return tenantId for context
- `findByEmail()` — add `tenantId` filter
- `findByStripeSessionId()` — no tenant filter needed (session is unique)
- `findBySquarespaceOrderId()` — no tenant filter needed
- `create()` — include `tenantId`

**Gift Card Templates** (`src/gift-card-templates/infrastructure/persistence/document/repositories/gift-card-template.repository.ts`):
- All methods: add `tenantId` filter
- `findActive()` — add `tenantId` filter (critical for public widget pages)

**Widgets** (`src/widgets/infrastructure/persistence/document/repositories/widget.repository.ts`):
- All methods: add `tenantId` filter
- `findByApiKey()` — apiKey is globally unique, returns widget with tenantId

**Settings** (`src/settings/infrastructure/persistence/document/repositories/settings.repository.ts`):
- `get()` → `get(tenantId)` — find by tenantId instead of `findOne()`
- `update()` → `update(tenantId, data)` — find by tenantId
- Create default settings when a new tenant is provisioned

### 2.5 Update All Services
Pass `tenantId` through from controllers to services to repositories:

- `GiftCardsService` — all methods receive `tenantId`
- `GiftCardTemplatesService` — all methods receive `tenantId`
- `WidgetsService` — all methods receive `tenantId`
- `SettingsService` — `get(tenantId)`, `update(tenantId, dto)`
- `SquarespaceService` — poll per-tenant (iterate all active tenants with squarespace config)

### 2.6 Update All Controllers
Extract `tenantId` from `request.user` (JWT) and pass to services:

- `GiftCardsController` — all authenticated endpoints use `req.user.tenantId`
- `GiftCardTemplatesController` — same
- `WidgetsController` — same
- `SettingsController` — same
- `UsersController` — for tenant-scoped user listing, filter by UserTenantAccess

**Public endpoints** (no JWT):
- `POST /gift-cards` (purchase): Requires `templateId` → look up template → get `tenantId`
- `POST /gift-cards/create-checkout-session`: Same as above
- `GET /gift-cards/code/:code`: Code is globally unique, return as-is
- `GET /gift-cards/email/:email`: Needs tenant context — add optional `tenantId` query param, or return all (grouped by tenant)
- `GET /gift-card-templates/active`: Needs `tenantId` query param (widget pages pass it)
- `GET /gift-card-templates/public/:id`: No change needed (ID is unique)
- `GET /widgets/public/:apiKey`: No change needed (apiKey is unique)
- `GET /settings`: Needs `tenantId` query param for public access
- `POST /gift-cards/stripe-webhook`: Resolve tenant from metadata in Stripe session

### 2.7 Seed Data & Migration Script
- **New file**: `src/database/seeds/document/tenant/tenant-seed.service.ts`
  - Create a default tenant (e.g., name: "Default", slug: "default")
- **New file**: `src/database/migrations/add-tenant-id.ts` (or a seed script)
  - Backfill `tenantId` on all existing Settings, GiftCardTemplate, GiftCard, Widget documents
  - Create UserTenantAccess records for all existing users → default tenant (preserving their current role)
  - Promote the seed admin to superAdmin role

---

## Phase 3: Frontend — Auth & Tenant Context

### 3.1 Update Types
- **File**: `src/services/api/types/role.ts`
  - Add `SUPER_ADMIN = 4` to `RoleEnum`
  - Add `Tenant` type: `{ id: string, name: string, slug: string }`
  - Add `UserTenantAccess` type: `{ tenantId: string, tenantName: string, tenantSlug: string, role: string }`
- **File**: `src/services/api/types/user.ts`
  - Add `tenants?: UserTenantAccess[]` to `User` type

### 3.2 Create Tenant Context
- **New file**: `src/services/tenant/tenant-context.ts` — React context for `{ currentTenantId, currentTenantName, tenants[], switchTenant() }`
- **New file**: `src/services/tenant/tenant-provider.tsx`
  - On auth load: Read user's tenants list from auth response
  - Store `currentTenantId` in localStorage (persist across refreshes)
  - `switchTenant()`: Call `POST /auth/switch-tenant`, update tokens, update context
  - If user has 0 tenants and is not superAdmin: Set a "no access" flag
- **New file**: `src/services/tenant/use-tenant.ts` — Hook to access tenant context

### 3.3 Update Auth Provider
- **File**: `src/services/auth/auth-provider.tsx`
  - After fetching `/auth/me`, extract `tenants` list
  - Pass to TenantProvider (or TenantProvider reads from auth context)
- **File**: `src/services/auth/auth-context.ts`
  - Add tenant info to context type

### 3.4 Update API Layer
- **File**: `src/services/api/use-fetch.ts`
  - Add `x-tenant-id` header to all requests (read from tenant context or localStorage)
  - This is the cleanest approach — a single header injection point
- **Alternative**: Each service hook reads tenantId and passes as query param. Header approach is simpler.

### 3.5 Update Layout
- **File**: `src/app/[language]/layout.tsx`
  - Wrap children with `TenantProvider` (inside AuthProvider, outside CurrencyProvider)
  - CurrencyProvider now fetches settings with tenantId

---

## Phase 4: Frontend — Tenant Switcher & No-Access Page

### 4.1 Tenant Switcher Component
- **New file**: `src/components/tenant-switcher.tsx`
  - Dropdown in the app bar (top right, before the profile avatar)
  - Shows current tenant name
  - Lists all accessible tenants
  - On select: calls `switchTenant()` from tenant context
  - If user has only 1 tenant: Show tenant name as static text (no dropdown)
  - If superAdmin: Show all tenants + "All Clients" option (for vendor admin)

### 4.2 Update App Bar
- **File**: `src/components/app-bar.tsx`
  - Add TenantSwitcher component between the nav links and the theme toggle
  - Add "Vendor Admin" link in nav for superAdmins
  - Update `isAdmin` / `isStaff` checks to use tenant-scoped role (from tenant context)

### 4.3 No-Access Page
- **New file**: `src/app/[language]/no-access/page.tsx` and `page-content.tsx`
  - Message: "Please contact your organisation to gain access to your site"
  - Shown when user is authenticated but has 0 tenant assignments
  - `withPageRequiredAuth` should redirect here instead of sign-in when user exists but has no tenants

### 4.4 Update withPageRequiredAuth
- **File**: `src/services/auth/with-page-required-auth.tsx`
  - Add `SUPER_ADMIN` to the role enum checks
  - If user is authenticated but has no tenants (and is not superAdmin): redirect to `/no-access`
  - Role checks should use the tenant-scoped role, not the global user role

---

## Phase 5: Frontend — Vendor Admin Page

### 5.1 Vendor Admin — Clients List
- **New file**: `src/app/[language]/admin-panel/vendor-admin/page.tsx`
- **New file**: `src/app/[language]/admin-panel/vendor-admin/page-content.tsx`
  - SuperAdmin-only page (wrapped with `withPageRequiredAuth({ roles: [RoleEnum.SUPER_ADMIN] })`)
  - Table of all tenants: Name, Slug, Active status, # Users, Created date
  - Actions: Edit, Deactivate/Activate
  - "Create Client" button

### 5.2 Vendor Admin — Create/Edit Client
- **New file**: `src/app/[language]/admin-panel/vendor-admin/create/page.tsx` and `page-content.tsx`
  - Form: Name, Slug (auto-generated from name, editable)
  - On create: Also creates default Settings for the tenant
- **New file**: `src/app/[language]/admin-panel/vendor-admin/[id]/edit/page.tsx` and `page-content.tsx`
  - Edit tenant details
  - **User Access Management** section:
    - List of users with access to this tenant, their role
    - Add user (search by email), assign role (admin/staff/user)
    - Remove user access
    - Change user's role within this tenant

### 5.3 Vendor Admin — API Services
- **New file**: `src/services/api/services/tenants.ts`
  - `useGetTenantsService()`, `useGetTenantService()`, `useCreateTenantService()`, `useUpdateTenantService()`, `useDeleteTenantService()`
- **New file**: `src/services/api/services/user-tenant-access.ts`
  - `useGetTenantUsersService()`, `useAddTenantUserService()`, `useUpdateTenantUserRoleService()`, `useRemoveTenantUserService()`
- **New file**: `src/services/api/types/tenant.ts`
  - Type definitions for Tenant and UserTenantAccess

### 5.4 Vendor Admin — React Query Keys
- **New file**: `src/app/[language]/admin-panel/vendor-admin/queries/queries.ts`

---

## Phase 6: Frontend — Update Existing Pages for Tenant Context

### 6.1 CurrencyProvider
- **File**: `src/services/currency/currency-provider.tsx`
  - Fetch settings with `tenantId` query param: `${API_URL}/v1/settings?tenantId=${tenantId}`
  - Re-fetch when tenant changes

### 6.2 Settings Page
- **File**: `src/app/[language]/admin-panel/gift-cards/settings/page-content.tsx`
  - No structural changes needed — the API layer handles tenant scoping via header
  - Settings are now per-tenant automatically

### 6.3 Widget Pages
- **File**: `src/app/widget/[apiKey]/page-content.tsx`
  - Widget lookup by apiKey already returns the widget with tenantId
  - Pass tenantId when fetching settings, templates, creating purchases
  - Add `tenantId` to checkout session metadata

### 6.4 Public Pages (Balance, QR, View)
- These pages look up by code, which is globally unique
  - The gift card response includes `tenantId`
  - Use that tenantId to fetch the correct template and settings
  - No URL changes needed

---

## Phase 7: Data Migration

### 7.1 Migration Script
Create a one-time migration script (`src/database/migrations/multi-tenant-migration.ts`):

```
1. Create default Tenant document { name: "Default", slug: "default", isActive: true }
2. Get the default tenant's ID
3. Update all GiftCard documents: set tenantId = defaultTenantId
4. Update all GiftCardTemplate documents: set tenantId = defaultTenantId
5. Update all Widget documents: set tenantId = defaultTenantId
6. Update Settings document: set tenantId = defaultTenantId
7. For each User:
   a. Create UserTenantAccess { userId, tenantId: defaultTenantId, role: user's current role name }
8. Update seed admin user: role = superAdmin (4)
```

### 7.2 Index Creation
Add MongoDB indexes:
- `gift-cards`: `{ tenantId: 1, purchaseDate: -1 }`, `{ tenantId: 1, status: 1 }`
- `gift-card-templates`: `{ tenantId: 1, isActive: 1 }`
- `widgets`: `{ tenantId: 1 }`
- `settings`: `{ tenantId: 1 }` (unique)
- `user-tenant-access`: `{ userId: 1, tenantId: 1 }` (unique), `{ tenantId: 1 }`

---

## Phase 8: Server-Side Tenant Header Middleware

### 8.1 Tenant Middleware (Alternative to JWT-embedded tenantId)
**Recommended approach**: Instead of embedding tenantId in JWT (which requires re-issuing tokens on switch), use a request header `x-tenant-id`.

- **New file**: `src/tenants/tenant.middleware.ts`
  - For authenticated requests: Read `x-tenant-id` header, validate user has access (via UserTenantAccess), attach to `request.tenantId`
  - For superAdmin: Any tenantId is valid
  - For public requests: Read `x-tenant-id` header if present, or resolve from context (widget apiKey, gift card code)
  - If no tenantId and endpoint requires one: Return 400

This is simpler than JWT-embedded tenantId because:
- No need to re-issue tokens when switching tenants
- Frontend just changes a header/localStorage value
- Token refresh doesn't need tenant context

### 8.2 Update Auth Flow (Simplified)
- Login response: Include `tenants[]` array
- `/auth/me` response: Include `tenants[]` array
- Remove the `switchTenant` endpoint — not needed with header approach
- JWT stays as-is (no tenantId in token)

---

## Implementation Order (Recommended)

1. **Phase 1** (Server infrastructure) — Can be done without breaking existing functionality
2. **Phase 7** (Migration script) — Run after Phase 1 to backfill data
3. **Phase 2** (Tenant-scoped queries) — This is the breaking change; frontend must be updated simultaneously
4. **Phase 8** (Header middleware) — Simplifies Phase 2
5. **Phase 3** (Frontend auth/context) — Must deploy with Phase 2
6. **Phase 4** (Switcher + no-access) — Can follow immediately
7. **Phase 5** (Vendor admin) — Can be built independently
8. **Phase 6** (Update existing pages) — Final polish

### Estimated Scope
- **Server**: ~25-30 files modified, ~15-20 new files
- **Frontend**: ~10-15 files modified, ~10-15 new files
- **Migration**: 1 script + index updates

---

## Open Questions / Decisions Needed

1. **Tenant in URL vs Header**: Should public pages use URL-based tenant routing (e.g., `/t/slug/gift-cards/balance`) or resolve tenant from the data (gift card code → tenantId → settings)?
   - **Recommendation**: Resolve from data for code-based lookups. For the widget embed and settings endpoint, use `tenantId` query param.

2. **User management scope**: Should the Users page (`/admin-panel/users`) show all users or only users with access to the current tenant?
   - **Recommendation**: Tenant admins see only users in their tenant. SuperAdmins see all users globally.

3. **Should tenants have custom domains?**: Not in v1. Use tenant slug for identification where needed.

4. **Email templates**: Should emails be tenant-branded?
   - **Recommendation**: Use tenant name in email subject/body. Full branding can come later.

5. **File uploads**: Should uploaded images (template images) be tenant-isolated?
   - **Recommendation**: Not strictly necessary since files are referenced by ID, but prefix upload paths with tenantId for organization.
