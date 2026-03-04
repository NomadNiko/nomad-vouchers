# Gift Card Management System - Design Document

## Executive Summary

A web-based gift card management system for restaurants that enables managers to create customizable gift card templates, sell them through an embeddable widget, and manage redemptions through a dedicated console.

## System Overview

### Core Components

1. **Manager Console** (React/Next.js Admin Panel)
2. **Embeddable Widget** (Standalone React component)
3. **REST API** (NestJS Backend)
4. **Database** (MongoDB)
5. **Email Service** (Existing Resend integration)

---

## Data Model

### 1. GiftCardTemplate
```typescript
{
  id: string
  name: string                    // "Holiday Special", "Birthday Card"
  description: string
  imageUrl: string                // S3/local file path
  isActive: boolean               // Available for purchase
  createdBy: User                 // Manager who created it
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
```

### 2. GiftCard
```typescript
{
  id: string
  code: string                    // Unique redemption code (e.g., "GC-XXXX-XXXX-XXXX")
  templateId: string              // Reference to GiftCardTemplate
  
  // Purchase Info
  originalAmount: number          // Initial purchase amount
  currentBalance: number          // Remaining balance
  purchaseDate: Date
  
  // Customer Info
  purchaserEmail: string
  purchaserName: string
  recipientEmail?: string         // Optional if gift for someone else
  recipientName?: string
  
  // Status
  status: 'active' | 'partially_redeemed' | 'fully_redeemed' | 'expired' | 'cancelled'
  
  // Redemption tracking
  redemptions: Redemption[]
  
  // Metadata
  expirationDate?: Date           // Optional expiration
  notes?: string                  // Custom message
  createdAt: Date
  updatedAt: Date
}
```

### 3. Redemption
```typescript
{
  id: string
  giftCardId: string
  amount: number                  // Amount redeemed
  redeemedBy: User                // Manager who processed it
  redeemedAt: Date
  notes?: string                  // Optional notes about redemption
  remainingBalance: number        // Balance after this redemption
}
```

### 4. User (Extended)
```typescript
{
  // Existing fields...
  role: 'admin' | 'manager' | 'user'
  restaurantId?: string           // For multi-restaurant support (future)
}
```

### 5. WidgetConfiguration
```typescript
{
  id: string
  restaurantId: string            // For future multi-tenant
  apiKey: string                  // Public API key for widget
  allowedDomains: string[]        // CORS whitelist
  customization: {
    primaryColor: string
    buttonText: string
    logoUrl?: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## API Endpoints

### Gift Card Templates

```
POST   /api/v1/gift-card-templates          Create template (Manager/Admin)
GET    /api/v1/gift-card-templates          List all templates (Manager/Admin)
GET    /api/v1/gift-card-templates/active   List active templates (Public)
GET    /api/v1/gift-card-templates/:id      Get single template
PATCH  /api/v1/gift-card-templates/:id      Update template (Manager/Admin)
DELETE /api/v1/gift-card-templates/:id      Soft delete template (Manager/Admin)
```

### Gift Cards

```
POST   /api/v1/gift-cards                   Purchase gift card (Public/Widget)
GET    /api/v1/gift-cards                   List all gift cards (Manager/Admin)
GET    /api/v1/gift-cards/:id               Get gift card details
GET    /api/v1/gift-cards/code/:code        Lookup by code (Manager/Public)
GET    /api/v1/gift-cards/email/:email      Lookup by email (Public)
PATCH  /api/v1/gift-cards/:id/cancel        Cancel gift card (Admin)
```

### Redemptions

```
POST   /api/v1/gift-cards/:id/redeem        Redeem gift card (Manager/Admin)
GET    /api/v1/gift-cards/:id/redemptions   Get redemption history
GET    /api/v1/redemptions                  List all redemptions (Manager/Admin)
```

### Widget Configuration

```
GET    /api/v1/widget/config                Get widget config (Public with API key)
POST   /api/v1/widget/config                Create/update config (Admin)
```

### Analytics/Reports

```
GET    /api/v1/reports/sales                Sales summary
GET    /api/v1/reports/redemptions          Redemption summary
GET    /api/v1/reports/outstanding          Outstanding balance report
```

---

## User Flows

### 1. Manager: Create Gift Card Template

1. Manager logs into console
2. Navigates to "Gift Card Templates"
3. Clicks "Create New Template"
4. Uploads image (drag-drop or file picker)
5. Enters name and description
6. Sets active/inactive status
7. Saves template
8. System stores image and creates template record

### 2. Customer: Purchase Gift Card (Widget)

1. Customer visits restaurant website with embedded widget
2. Widget loads active templates
3. Customer selects template
4. Enters amount (with min/max validation)
5. Enters purchaser info (name, email)
6. Optionally enters recipient info
7. Adds custom message
8. Reviews order
9. Clicks "Purchase" (payment integration placeholder)
10. System generates unique code
11. System creates GiftCard record
12. System sends email with PDF/image of gift card
13. Widget displays success with gift card preview

### 3. Manager: Redeem Gift Card

1. Manager logs into console
2. Navigates to "Redeem Gift Card"
3. Enters gift card code or scans QR code
4. System displays gift card details and current balance
5. Manager enters redemption amount
6. Optionally adds notes
7. Confirms redemption
8. System updates balance and creates redemption record
9. System displays updated balance

### 4. Customer: Check Balance

1. Customer visits balance lookup page (public)
2. Enters gift card code OR email address
3. System displays gift card(s) with current balance
4. Shows redemption history

---

## Frontend Architecture

### Manager Console Routes

```
/admin-panel/gift-cards
  /templates                      List all templates
  /templates/new                  Create new template
  /templates/:id/edit             Edit template
  
  /purchases                      List all purchases
  /purchases/:id                  View purchase details
  
  /redeem                         Redeem gift card interface
  
  /reports                        Analytics dashboard
    /sales                        Sales reports
    /redemptions                  Redemption reports
    /outstanding                  Outstanding balances
```

### Public Routes

```
/gift-cards/balance               Balance lookup page
/gift-cards/view/:code            View gift card (for printing)
```

### Widget (Standalone)

- Embeddable React component
- Minimal dependencies
- Configurable styling
- Communicates with public API endpoints

---

## Technical Implementation Details

### Gift Card Code Generation

```typescript
// Format: GC-XXXX-XXXX-XXXX (16 characters + dashes)
// Uses crypto-secure random generation
// Validates uniqueness before saving
function generateGiftCardCode(): string {
  const segments = 3;
  const segmentLength = 4;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars
  
  // Generate segments
  // Check uniqueness in database
  // Return formatted code
}
```

### Gift Card Visual Generation

**Option 1: Server-side PDF Generation**
- Use library like `pdfkit` or `puppeteer`
- Generate PDF with template image + code + amount
- Store as file or generate on-demand

**Option 2: Client-side Canvas/HTML**
- Render gift card in browser using Canvas API
- Allow download as image/PDF
- Lighter server load

**Recommendation**: Option 2 for MVP, Option 1 for production

### Email Template

```html
Subject: Your Gift Card - [Restaurant Name]

Body:
- Thank you message
- Gift card visual (embedded image or PDF attachment)
- Gift card code (large, readable)
- Amount
- Balance lookup link
- Expiration info (if applicable)
- Terms and conditions
```

### Widget Embedding

```html
<!-- Restaurant website embeds this -->
<div id="gift-card-widget"></div>
<script src="https://gift-cards.nomadsoft.us/widget.js"></script>
<script>
  GiftCardWidget.init({
    apiKey: 'pub_xxxxxxxxxxxx',
    containerId: 'gift-card-widget',
    theme: {
      primaryColor: '#ff6b6b'
    }
  });
</script>
```

### Security Considerations

1. **Widget API Key**: Public key for widget, rate-limited
2. **CORS**: Whitelist allowed domains for widget
3. **Gift Card Codes**: Crypto-secure random generation
4. **Redemption Auth**: Only authenticated managers can redeem
5. **Balance Lookup**: Rate-limited to prevent brute force
6. **Input Validation**: Strict validation on amounts, emails, codes

---

## Database Indexes

```typescript
// GiftCard collection
{
  code: 1,              // Unique index for fast lookup
  purchaserEmail: 1,    // For email-based lookup
  status: 1,            // Filter by status
  purchaseDate: -1      // Sort by date
}

// GiftCardTemplate collection
{
  isActive: 1,          // Filter active templates
  createdAt: -1         // Sort by date
}

// Redemption collection
{
  giftCardId: 1,        // Lookup redemptions for a card
  redeemedAt: -1        // Sort by date
}
```

---

## MVP Feature Scope

### Phase 1: Core Functionality (Current Sprint)

✅ **Must Have**
- Gift card template CRUD (manager console)
- Image upload for templates
- Gift card purchase flow (no payment)
- Unique code generation
- Gift card visual display/print
- Email delivery
- Redemption interface (full & partial)
- Balance lookup (by code)
- Basic list views (templates, purchases, redemptions)

❌ **Deferred**
- Payment gateway integration (Stripe/Square)
- QR code scanning
- Multi-restaurant/tenant support
- Advanced analytics/charts
- Gift card expiration automation
- Bulk operations
- Export to CSV/PDF
- Mobile app
- SMS notifications

### Phase 2: Enhancement (Future)
- Payment integration
- Advanced reporting with charts
- QR code generation and scanning
- Gift card expiration handling
- Refund/cancellation workflow
- Email customization
- Widget customization UI

---

## File Structure

### Backend (NestJS)

```
src/
  gift-card-templates/
    domain/
      gift-card-template.ts
    dto/
      create-gift-card-template.dto.ts
      update-gift-card-template.dto.ts
      query-gift-card-template.dto.ts
    infrastructure/
      persistence/
        document/
          gift-card-template.schema.ts
          gift-card-template.repository.ts
    gift-card-templates.controller.ts
    gift-card-templates.service.ts
    gift-card-templates.module.ts
  
  gift-cards/
    domain/
      gift-card.ts
      redemption.ts
    dto/
      create-gift-card.dto.ts
      redeem-gift-card.dto.ts
      query-gift-card.dto.ts
    infrastructure/
      persistence/
        document/
          gift-card.schema.ts
          gift-card.repository.ts
    gift-cards.controller.ts
    gift-cards.service.ts
    gift-cards.module.ts
  
  widget/
    widget.controller.ts
    widget.service.ts
    widget.module.ts
  
  reports/
    reports.controller.ts
    reports.service.ts
    reports.module.ts
```

### Frontend (Next.js)

```
src/
  app/
    [language]/
      admin-panel/
        gift-cards/
          templates/
            page.tsx                    # List templates
            new/
              page.tsx                  # Create template
            [id]/
              edit/
                page.tsx                # Edit template
          purchases/
            page.tsx                    # List purchases
            [id]/
              page.tsx                  # Purchase details
          redeem/
            page.tsx                    # Redemption interface
          reports/
            page.tsx                    # Reports dashboard
      
      gift-cards/
        balance/
          page.tsx                      # Public balance lookup
        view/
          [code]/
            page.tsx                    # View/print gift card
  
  components/
    gift-cards/
      template-form.tsx
      template-card.tsx
      gift-card-visual.tsx
      redemption-form.tsx
      balance-lookup.tsx
  
  services/
    api/
      services/
        gift-card-templates.ts
        gift-cards.ts
        redemptions.ts
      types/
        gift-card-template.ts
        gift-card.ts
        redemption.ts
  
  widget/
    index.tsx                           # Standalone widget entry
    widget-app.tsx
    widget-styles.css
```

---

## UI/UX Mockup Descriptions

### 1. Template Management Page
- **Header**: "Gift Card Templates" with "Create New" button
- **Grid/List View**: Cards showing template image, name, status badge
- **Actions**: Edit, Delete, Toggle Active
- **Filters**: Active/Inactive, Search by name

### 2. Create/Edit Template Form
- **Image Upload**: Drag-drop zone with preview
- **Fields**: Name, Description
- **Toggle**: Active/Inactive
- **Preview**: Live preview of how it will appear in widget
- **Actions**: Save, Cancel

### 3. Purchases List
- **Table Columns**: Code, Template, Amount, Balance, Purchaser, Date, Status
- **Filters**: Date range, Status, Template
- **Search**: By code, email
- **Actions**: View details, Cancel (admin only)

### 4. Redemption Interface
- **Code Input**: Large input field with "Lookup" button
- **Gift Card Display**: Shows template image, code, current balance
- **Redemption Form**: Amount input, Notes textarea
- **Validation**: Cannot exceed current balance
- **History**: List of previous redemptions below
- **Actions**: Redeem, Cancel

### 5. Balance Lookup (Public)
- **Simple Interface**: Code or Email input
- **Results**: List of gift cards with balances
- **Gift Card Card**: Template image, code (partially masked), balance
- **Action**: "View Full Details" (shows full code)

### 6. Widget (Embedded)
- **Step 1**: Template selection (grid of active templates)
- **Step 2**: Amount input (with min/max validation)
- **Step 3**: Customer info (name, email, optional recipient)
- **Step 4**: Review and purchase
- **Step 5**: Success with gift card preview and download option

---

## Email Templates

### Purchase Confirmation Email

**Subject**: Your [Restaurant Name] Gift Card

**Body**:
```
Hi [Purchaser Name],

Thank you for purchasing a gift card from [Restaurant Name]!

Gift Card Details:
- Code: GC-XXXX-XXXX-XXXX
- Amount: $XX.XX
- Valid Until: [Date or "No Expiration"]

[Gift Card Visual Image]

To check your balance or view your gift card anytime, visit:
[Balance Lookup URL]

Terms & Conditions:
- Gift cards are non-refundable
- Can be used for partial payments
- [Additional terms]

Questions? Contact us at [Contact Email]

Enjoy!
[Restaurant Name]
```

---

## Testing Strategy

### Unit Tests
- Gift card code generation (uniqueness, format)
- Balance calculation after redemptions
- Validation logic (amounts, emails, codes)

### Integration Tests
- Template CRUD operations
- Gift card purchase flow
- Redemption flow with balance updates
- Email sending

### E2E Tests
- Manager creates template and activates it
- Customer purchases gift card through widget
- Manager redeems gift card (partial and full)
- Customer checks balance

---

## Performance Considerations

1. **Image Optimization**: Compress uploaded template images
2. **Caching**: Cache active templates for widget
3. **Pagination**: All list views paginated
4. **Indexes**: Database indexes on frequently queried fields
5. **Rate Limiting**: Widget API endpoints rate-limited
6. **CDN**: Serve widget script and static assets from CDN (future)

---

## Monitoring & Analytics

### Key Metrics
- Total gift cards sold
- Total revenue (when payment integrated)
- Average gift card value
- Redemption rate
- Outstanding balance
- Time to redemption
- Popular templates

### Logging
- All redemptions logged with manager ID
- Failed purchase attempts
- Balance lookup attempts (for fraud detection)

---

## Migration Path

### From Current Boilerplate
1. Keep existing auth system (users, roles)
2. Add "manager" role to existing role enum
3. Extend file upload for template images
4. Create new modules: gift-card-templates, gift-cards, redemptions, widget
5. Update admin panel navigation
6. Create new public routes for widget and balance lookup

---

## Future Enhancements

1. **Multi-Restaurant Support**: Add restaurant entity, scope all data
2. **QR Codes**: Generate QR codes for easy scanning
3. **Mobile App**: Native app for managers to redeem on-the-go
4. **Gift Card Bundles**: Sell multiple cards at discount
5. **Recurring Gift Cards**: Subscription-based gift cards
6. **Integration APIs**: Webhook for POS integration
7. **Advanced Analytics**: Predictive analytics, customer insights
8. **Marketing**: Promotional campaigns, discount codes
9. **White Label**: Allow restaurants to fully brand the system

---

## Timeline Estimate (MVP)

### Week 1: Backend Foundation
- Database schemas
- Gift card template CRUD
- Gift card purchase endpoint
- Code generation logic

### Week 2: Backend Completion
- Redemption logic
- Balance lookup
- Email integration
- Reports endpoints

### Week 3: Manager Console
- Template management UI
- Purchases list
- Redemption interface
- Reports dashboard

### Week 4: Widget & Polish
- Embeddable widget
- Public balance lookup
- Gift card visual generation
- Testing and bug fixes

**Total: 4 weeks for MVP**

---

## Success Criteria

✅ Manager can create and manage gift card templates  
✅ Customers can purchase gift cards (without payment)  
✅ Gift cards are emailed with unique codes  
✅ Managers can redeem full or partial amounts  
✅ Customers can check balances  
✅ All transactions are tracked and auditable  
✅ Widget can be embedded on external websites  
✅ System is secure and performant  

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Code collision | High | Crypto-secure generation + uniqueness check |
| Email delivery failure | Medium | Queue system + retry logic |
| Widget CORS issues | Medium | Proper CORS configuration + testing |
| Balance calculation errors | High | Atomic transactions + validation |
| Unauthorized redemptions | High | Strong auth + audit logging |
| Image upload abuse | Medium | File size limits + validation |

---

## Conclusion

This design provides a complete, production-ready gift card management system that meets all stated requirements. The architecture leverages the existing boilerplate infrastructure while adding focused, domain-specific functionality. The phased approach ensures a working MVP can be delivered quickly while leaving room for future enhancements.
