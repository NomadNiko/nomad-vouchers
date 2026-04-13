# Multi-Tenant Conversion — Architecture Notes

## Current Architecture Summary

### Database
- MongoDB (document database) via Mongoose
- Single MongoDB Atlas cluster: `gift-cards-dev-server` database
- No tenant/client isolation — all data in flat collections

### Server (NestJS, `/var/www/gift-cards-dev-server/`)
- **Roles**: `admin=1`, `user=2`, `staff=3` (enum in `src/roles/roles.enum.ts`)
- **RolesGuard**: Checks `request.user.role.id` against allowed roles via `@Roles()` decorator
- **JWT Payload**: Contains `{ id, role: { id }, sessionId }` — no tenant info
- **User domain**: Has `id, email, password, provider, socialId, firstName, lastName, photo, role, status, createdAt, updatedAt, deletedAt`
- **User schema**: Embedded `role` and `status` objects (not references)

### Data Models (all tenant-unaware currently)
- **Settings**: Singleton document (one per DB). Currency, payment config, notification emails, Squarespace config
- **GiftCardTemplate**: Has `name, image, codePosition, redemptionType, expirationDate/Months, codePrefix, qrPosition, adminFee, isActive, createdBy`
- **GiftCard**: Has `code, templateId, widgetId, originalAmount, currentBalance, purchaserEmail, purchaserName, recipientEmail, recipientName, status, redemptions[], stripeSessionId, squarespaceOrderId, isArchived`
- **Widget**: Has `name, templateId, apiKey, allowedDomains, customization, isActive, createdBy, redirectUrl`

### Key Server Endpoints
- **Public** (no auth): `GET /settings`, `GET /settings/public/payment-config`, `POST /gift-cards` (purchase), `POST /gift-cards/create-checkout-session`, `POST /gift-cards/stripe-webhook`, `GET /gift-cards/code/:code`, `GET /gift-cards/email/:email`, `GET /gift-card-templates/active`, `GET /gift-card-templates/public/:id`, `GET /widgets/public/:apiKey`, `GET /widgets/loader/:apiKey/widget.js`
- **Admin/Staff** (JWT + role guard): All CRUD for gift-cards, templates, widgets, settings, users

### Frontend (Next.js, `/var/www/gift-cards-dev/`)
- **Auth**: `AuthProvider` fetches `/auth/me`, stores user in context. `withPageRequiredAuth` HOC checks role.
- **Role checks**: `RoleEnum.ADMIN=1`, `RoleEnum.USER=2`, `RoleEnum.STAFF=3`
- **Navigation**: `app-bar.tsx` shows different menus based on `isAdmin` / `isStaff`
- **API calls**: All use `API_URL` from env (`NEXT_PUBLIC_API_URL`), no tenant scoping
- **CurrencyProvider**: Fetches settings from API on mount
- **Middleware**: Language detection/redirect only, no tenant routing
- **Layout**: Single layout with `AuthProvider > CurrencyProvider > AppBar > children`

### Key Observations
1. Settings is a singleton — needs to become per-tenant
2. All data models lack any `tenantId` / `clientId` field
3. JWT tokens don't carry tenant context
4. Public endpoints (widget, balance lookup, purchase) need tenant resolution via different mechanism (widget apiKey already identifies a widget, but not a tenant)
5. The Squarespace polling service is global — needs to become per-tenant
6. User-to-tenant is currently implicit (one tenant = one deployment)
7. File uploads are local — shared across tenants (may need tenant-prefixed paths)

---

## Multi-Tenant Design Decisions

### Tenant Isolation Strategy
**Shared database, tenant ID on every document** — simplest migration path. Add `tenantId` field to: Settings, GiftCardTemplate, GiftCard, Widget. Index on `tenantId` for all queries.

### New Entities
1. **Tenant** (new collection): `{ id, name, slug, domain?, isActive, createdAt, updatedAt }`
2. **UserTenantAccess** (new collection or embedded in User): Maps users to tenants with optional per-tenant role override

### Role Changes
- Add `superAdmin=4` to RoleEnum
- SuperAdmin is a global role (not per-tenant)
- Existing admin/staff/user roles become per-tenant via UserTenantAccess

### Auth Flow Changes
- JWT payload adds: `tenantId` (currently active tenant)
- Login response includes: list of accessible tenants
- `/auth/me` response includes: accessible tenants list
- New endpoint: `POST /auth/switch-tenant` — re-issues JWT with new tenantId
- SuperAdmin gets access to all tenants automatically

### Server Changes Required
1. New `Tenant` module (domain, schema, repository, service, controller)
2. New `UserTenantAccess` — either embedded in User or separate collection
3. Add `tenantId` to: Settings schema, GiftCardTemplate schema, GiftCard schema, Widget schema
4. **TenantGuard** middleware: Extracts `tenantId` from JWT, injects into request
5. All repositories: Filter by `tenantId` from request context
6. All controllers: Pass `tenantId` through to services
7. Public endpoints: Resolve tenant from widget apiKey, gift card code, or explicit tenant slug
8. Settings: Change from singleton to per-tenant document
9. Squarespace polling: Per-tenant polling instances
10. Seed data: Create default tenant, assign existing admin to it

### Frontend Changes Required
1. Add `tenantId` to auth context and API calls
2. **Tenant switcher** component in app bar (top right, near profile menu)
3. New **Vendor Admin** page (`/admin-panel/vendor-admin`) — SuperAdmin only
4. Update `withPageRequiredAuth` to support `superAdmin` role
5. All API service hooks: Include `tenantId` header or query param
6. CurrencyProvider: Fetch per-tenant settings
7. "No access" page for users with no tenant assignments
8. Navigation: Show "Vendor Admin" link for superAdmins

### Public Endpoint Tenant Resolution
- **Widget pages** (`/widget/[apiKey]`): Widget already has apiKey → look up widget → get tenantId
- **Balance lookup** (`/gift-cards/balance`): Need tenant context — either from URL slug or from the gift card code itself
- **QR redirect** (`/gift-cards/qr/[code]`): Code lookup returns gift card with tenantId
- **Gift card view** (`/gift-cards/view/[code]`): Same as above
- **Settings** (`GET /settings`): Needs tenantId — for public pages, derive from widget/code context

### Migration Strategy
1. Create default tenant
2. Add `tenantId` to all existing documents (backfill with default tenant ID)
3. Create UserTenantAccess records for all existing users → default tenant
4. Update all queries to filter by tenantId
5. Existing admin user becomes superAdmin
