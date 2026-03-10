# UX Improvement Plan - CoLab Customer Portal

## Design References & Inspiration

Browse these for visual inspiration before deciding:

**Utility Payment Apps:**
- [Dribbble - Utility Payment App](https://dribbble.com/tags/utility-payment-app) - 100+ designs
- [Dribbble - Bill Payment](https://dribbble.com/tags/bill-payment) - Payment flows
- [Behance - Utility Payment App](https://www.behance.net/search/projects/utility%20payment%20app) - Case studies

**Energy & Usage Apps:**
- [Dribbble - Energy App](https://dribbble.com/tags/energy-app) - 31 designs
- [Dribbble - Energy Monitoring App](https://dribbble.com/tags/energy-monitoring-app) - Usage tracking
- [Dribbble - Electricity App](https://dribbble.com/tags/electricity-app) - 21 designs

**Templates:**
- [Uizard - Bill Tracker Template](https://uizard.io/templates/mobile-app-templates/bill-tracker-mobile-app/)
- [GraphicRiver - PayQuick UI Kit](https://graphicriver.net/item/online-bill-payment-app-ui-kit-recharge-app-ui-kit-booking-app-ui-kit-wallet-app-ui-payquick/44861354) - 28 screens

---

## Proposed Wireframes (ASCII)

### Dashboard - Modern Card Layout
```
┌─────────────────────────────────┐
│  [Logo]  CoLab    🔔(3) [Avatar]│
├─────────────────────────────────┤
│                                 │
│  Good morning, John! 👋         │
│                                 │
│  ┌─────────────────────────┐   │
│  │  💰 Total Due            │   │
│  │  ██████████████████████ │   │
│  │  RON 1,234.56           │   │
│  │  ─────────────────────  │   │
│  │  [Pay All]  [View Bills]│   │
│  └─────────────────────────┘   │
│                                 │
│  My Utilities                   │
│  ┌──────────┐ ┌──────────┐     │
│  │ ⚡        │ │ 🔥        │     │
│  │ Electric │ │ Gas      │     │
│  │ RON 450  │ │ RON 234  │     │
│  │ Due 5d   │ │ Paid ✓   │     │
│  └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐     │
│  │ 💧        │ │ 🚿        │     │
│  │ Water    │ │ Sewage   │     │
│  │ RON 89   │ │ RON 45   │     │
│  │ Due 12d  │ │ Due 12d  │     │
│  └──────────┘ └──────────┘     │
│                                 │
│  📊 Usage This Month           │
│  ┌─────────────────────────┐   │
│  │  ▂▄▆█▆▄▂▄▆█▆▄ (chart)  │   │
│  │  -12% vs last month     │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│ [🏠] [📄] [📊] [👤]            │
│ Home  Bills Usage Profile      │
└─────────────────────────────────┘
```

### Invoice List - With Search & Filters
```
┌─────────────────────────────────┐
│  ← Bills                   🔍  │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ 🔍 Search invoices...   │   │
│  └─────────────────────────┘   │
│                                 │
│  [All] [Unpaid] [Paid] [Overdue]│
│  ───────────────────────────── │
│                                 │
│  UNPAID (3)                     │
│  ┌─────────────────────────┐   │
│  │ ⚡ Electricity    RON 450│   │
│  │ INV-2024-001   Due Dec 25│   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │ ← Swipe to Pay →        │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 💧 Water         RON 89 │   │
│  │ INV-2024-002   Due Jan 2│   │
│  └─────────────────────────┘   │
│                                 │
│  DECEMBER 2024                  │
│  ┌─────────────────────────┐   │
│  │ 🔥 Gas    ✓ Paid  RON 234│   │
│  │ INV-2024-003   Dec 15   │   │
│  └─────────────────────────┘   │
│                                 │
│  ↓ Pull to refresh             │
│                                 │
├─────────────────────────────────┤
│ [🏠] [📄] [📊] [👤]            │
└─────────────────────────────────┘
```

### Invoice Detail - Clean & Actionable
```
┌─────────────────────────────────┐
│  ←                        ⋮    │
├─────────────────────────────────┤
│         ⚡                      │
│      Electricity                │
│      INV-2024-001               │
│                                 │
│    ┌───────────────────┐       │
│    │    RON 450.00     │       │
│    │    ──────────     │       │
│    │   🔴 UNPAID       │       │
│    │   Due: Dec 25     │       │
│    └───────────────────┘       │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  📍 123 Main Street, Apt 4B    │
│  📋 Contract: CTR-12345        │
│  📅 Period: Nov 1 - Nov 30     │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Breakdown                      │
│  ├─ Energy (245 kWh)   RON 392 │
│  ├─ Distribution        RON 45 │
│  ├─ Taxes               RON 13 │
│  └─ Total              RON 450 │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  ┌─────────────────────────┐   │
│  │  💳 Pay RON 450.00      │   │
│  └─────────────────────────┘   │
│  [📄 Download PDF] [📤 Share]  │
│                                 │
└─────────────────────────────────┘
```

### Subscription/Utility Detail
```
┌─────────────────────────────────┐
│  ←  Electricity            ⋮   │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │  ⚡ Active              │   │
│  │  Contract: CTR-12345    │   │
│  │  123 Main Street        │   │
│  └─────────────────────────┘   │
│                                 │
│  [Usage] [Bills] [Meters]       │
│  ═══════════════════════════   │
│                                 │
│  📊 Usage Overview              │
│  ┌─────────────────────────┐   │
│  │     ▂▃▅▆█▆▅▃▂▃▅▆        │   │
│  │  J F M A M J J A S O N D│   │
│  └─────────────────────────┘   │
│                                 │
│  This Month: 245 kWh           │
│  ↓ 12% less than last month    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  📈 Comparison                  │
│  ┌────────────┬────────────┐   │
│  │ This Month │ Last Month │   │
│  │   245 kWh  │   278 kWh  │   │
│  │  RON 392   │  RON 445   │   │
│  └────────────┴────────────┘   │
│                                 │
│  💡 Tip: You're using 15% less │
│     than similar households    │
│                                 │
└─────────────────────────────────┘
```

### Profile - Quick Actions
```
┌─────────────────────────────────┐
│  Profile                       │
├─────────────────────────────────┤
│                                 │
│         ┌─────┐                │
│         │ JD  │                │
│         └─────┘                │
│        John Doe                 │
│     john@email.com             │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Account                        │
│  ┌─────────────────────────┐   │
│  │ 👤 Edit Profile      →  │   │
│  ├─────────────────────────┤   │
│  │ 🔒 Security          →  │   │
│  ├─────────────────────────┤   │
│  │ 🔔 Notifications     →  │   │
│  ├─────────────────────────┤   │
│  │ 🌐 Language: EN      →  │   │
│  └─────────────────────────┘   │
│                                 │
│  My Suppliers                   │
│  ┌─────────────────────────┐   │
│  │ [Logo] Enel     ✓      │   │
│  ├─────────────────────────┤   │
│  │ [Logo] E.ON           →│   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  🚪 Sign Out            │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Alerts & Notifications Center
```
┌─────────────────────────────────┐
│  ← Notifications          ⚙️   │
├─────────────────────────────────┤
│                                 │
│  [All] [Unread] [Alerts]        │
│  ───────────────────────────── │
│                                 │
│  TODAY                          │
│  ┌─────────────────────────┐   │
│  │ 🔴 ⚠️ Bill Overdue       │   │
│  │ Your electricity bill   │   │
│  │ is 5 days overdue       │   │
│  │ [Pay Now]     2h ago    │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 💰 Payment Received     │   │
│  │ RON 234.00 for Gas      │   │
│  │ invoice confirmed       │   │
│  │              5h ago     │   │
│  └─────────────────────────┘   │
│                                 │
│  YESTERDAY                      │
│  ┌─────────────────────────┐   │
│  │ 📄 New Invoice          │   │
│  │ Water bill for Dec      │   │
│  │ RON 89.00 due Jan 2     │   │
│  │ [View]        Yesterday │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 📊 Usage Alert          │   │
│  │ Your electricity usage  │   │
│  │ is 20% higher than avg  │   │
│  │              Yesterday  │   │
│  └─────────────────────────┘   │
│                                 │
│  EARLIER                        │
│  ┌─────────────────────────┐   │
│  │ 🔧 Scheduled Maintenance│   │
│  │ Water service will be   │   │
│  │ interrupted Dec 20      │   │
│  │              3 days ago │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Notification Settings
```
┌─────────────────────────────────┐
│  ← Notification Settings       │
├─────────────────────────────────┤
│                                 │
│  Push Notifications             │
│  ┌─────────────────────────┐   │
│  │ 📄 New Invoices    [●]  │   │
│  ├─────────────────────────┤   │
│  │ ⚠️ Payment Due     [●]  │   │
│  ├─────────────────────────┤   │
│  │ 🔴 Overdue Bills   [●]  │   │
│  ├─────────────────────────┤   │
│  │ 💰 Payment Confirm [●]  │   │
│  ├─────────────────────────┤   │
│  │ 📊 Usage Alerts    [○]  │   │
│  ├─────────────────────────┤   │
│  │ 🔧 Service Updates [○]  │   │
│  └─────────────────────────┘   │
│                                 │
│  Email Notifications            │
│  ┌─────────────────────────┐   │
│  │ 📧 Weekly Summary  [●]  │   │
│  ├─────────────────────────┤   │
│  │ 📧 Invoice PDF     [●]  │   │
│  └─────────────────────────┘   │
│                                 │
│  Alert Thresholds               │
│  ┌─────────────────────────┐   │
│  │ ⚡ Electricity          │   │
│  │ Alert when > [300] kWh  │   │
│  ├─────────────────────────┤   │
│  │ 🔥 Gas                  │   │
│  │ Alert when > [150] m³   │   │
│  ├─────────────────────────┤   │
│  │ 💧 Water                │   │
│  │ Alert when > [20] m³    │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Alert Types for Utility Apps

| Alert Type | Trigger | Priority |
|------------|---------|----------|
| 🔴 Overdue Bill | Invoice past due date | High |
| ⚠️ Payment Due Soon | 3-5 days before due | Medium |
| 📄 New Invoice | Invoice generated | Normal |
| 💰 Payment Confirmed | Payment successful | Normal |
| 📊 Usage Spike | Usage > threshold | Medium |
| 📈 High Bill Prediction | Estimated bill > average | Medium |
| 🔧 Service Maintenance | Scheduled outage | Normal |
| ⚡ Outage Alert | Unplanned service outage | High |
| 📉 Usage Savings | Usage below threshold | Low |
| 🎉 Milestone | Paid on time streak | Low |

---

## Design System Recommendations

### Color Palette (Keep existing + enhance)
```
Primary:     #1976D2 (Blue)
Success:     #21BA45 (Green) - Paid
Warning:     #F2C037 (Yellow) - Due soon
Danger:      #C10015 (Red) - Overdue

Utilities:
⚡ Electric: #F59E0B (Amber)
🔥 Gas:      #F97316 (Orange)
💧 Water:    #3B82F6 (Blue)
🚿 Sewage:   #14B8A6 (Teal)
```

### Typography
```
Headings:    Inter 600-700
Body:        Inter 400-500
Numbers:     Inter 600 (tabular)
```

### Spacing
```
xs: 4px   sm: 8px   md: 16px   lg: 24px   xl: 32px
```

---

## Implementation Priority (Recommended)

### Phase 1: Core UX
1. Dashboard redesign with utility cards grid
2. Search bar on invoice list
3. Skeleton loaders (replace spinners)
4. Pull-to-refresh on all lists
5. Better invoice card with swipe actions

### Phase 2: Notifications & Alerts
1. Notification center page
2. Notification bell with badge in header
3. Notification settings page
4. In-app notification cards
5. Usage threshold alerts setup

### Phase 3: Data & Charts
1. Install ApexCharts
2. Interactive usage chart on dashboard
3. Usage comparison cards
4. Sparklines in utility cards

### Phase 4: Polish
1. Better empty states with illustrations
2. Micro-interactions (card press, transitions)
3. Bottom sheet for filters
4. Push notifications (Capacitor)

---

## Files to Modify

**Existing Pages:**
```
src/pages/dashboard/DashboardPage.vue    - Redesign layout
src/pages/invoices/InvoiceListPage.vue   - Add search, swipe
src/pages/invoices/InvoiceDetailPage.vue - Cleaner layout
src/pages/subscriptions/*                - Usage charts
src/pages/profile/ProfilePage.vue        - Add notification settings link
src/layouts/MainLayout.vue               - Add notification bell
```

**New Pages:**
```
src/pages/notifications/NotificationListPage.vue   - NEW
src/pages/notifications/NotificationSettingsPage.vue - NEW
```

**Components:**
```
src/components/InvoiceCard.vue           - Swipe actions
src/components/UsageChart.vue            - Replace with ApexCharts
src/components/SkeletonLoader.vue        - NEW
src/components/EmptyState.vue            - NEW
src/components/NotificationCard.vue      - NEW
src/components/NotificationBadge.vue     - NEW
```

**Services & Stores:**
```
src/services/notification.service.ts     - NEW
src/stores/notification.ts               - NEW
src/types/notification.types.ts          - NEW
```

**Styles:**
```
src/css/app.sass                         - New utility classes
```

**Routes:**
```
src/router/routes.ts                     - Add notification routes
```
