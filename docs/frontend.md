# Detailed Frontend Architecture: BiHocam

## Tech Stack (Update)
- **Framework**: Next.js (App Router, Server Actions)
- **State Management**: React Query for data sync, Zustand for UI state.
- **Rich Text**: Lexical or TipTap for course content and forum.
- **Visuals**: Framer Motion for premium transitions, Tailwind for utility-first styling.

## Detailed Module Views

### 1. Education Module (Wizard-driven)
- **Course Builder**: A 5-step horizontal stepper.
  1. *Temel Bilgiler*: Name, Category, SEO Meta.
  2. *Medya*: Thumbnail upload, Demo video URL (YouTube/Vimeo integration).
  3. *İçerik*: Lesson list (Video, PDF, Quiz).
  4. *Fiyatlandırma*: Discount types, currency selection.
  5. *Sertifika*: Template selector for automatic issuance.
- **Quiz Interface**: Full-screen focused UI with timer, progress bar, and "Submit" modal.
- **Assignment View**: Split-screen (PDF/Text Viewer on left, Grading/Feedback form on right).

### 2. Marketing & Conversion Dashboard
- **Coupon Manager**: Advanced form with conditional fields.
  - *Trigger types*: First purchase, Cart value, Specific Category.
  - *Usage Limits*: Global limit vs. Per-user limit.
- **Promotion Modals**: Drag-and-drop editor for Banners and Popup Modals.
- **Abandoned Cart**: Dashboard showing users who left items, with "Send Email" CTA.

### 3. Organization (Kurum) Mini-Portal
- **Multi-Tenant Dashboard**: Branded view for organizations.
- **Member Management**: Data tables with bulk invite (CSV upload) and role assignment.
- **Private Content**: Tag-based visibility logic for courses (Public vs. Org-only).

### 4. Financial & Analytics
- **Earnings Graph**: Recharts or Chart.js for daily/monthly revenue.
- **Payout Management**: Table showing manual Bank Transfer (EFT) requests with status (Pending/Done).

## Design System
- **Glassmorphism**: Applied to sidebar and dashboard cards.
- **Micro-interactions**: Subtle scale-up on hover for course cards, smooth loading skeletons.
