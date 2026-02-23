# Detailed Backend Architecture: BiHocam

## Technical Specs (Update)
- **Database**: PostgreSQL (Prisma or SQLAlchemy Async)
- **File Storage**: AWS S3 or Google Cloud Storage for Video/Docs.
- **Message Broker**: Redis for real-time notifications and abandoned cart tasks.
- **Worker**: Celery/Arq for email automation and certificate generation.

## Router & Controller Logic

### 1. Education Engine (`/api/v1/education`)
- `POST /courses/wizard`: Handles step-by-step progress saving.
- `GET /quizzes/{id}/attempt`: Logic for calculating scores and retry limits.
- `POST /certificates/generate`: PDF Generation based on quiz success.

### 2. Marketing Logic (`/api/v1/marketing`)
- `POST /coupons/validate`: Real-time validation against cart items, user limits, and dates.
- `GET /campaigns/active`: Returns banners/modals based on user segments.

### 3. Financial System (`/api/v1/financial`)
- **Commission Calculator**: Utility service to deduct platform fees (Default 35%) before updating teacher balances.
- **Payment Gateway**: Integration with Iyzico/Paytr for credit cards.
- **Manual EFT**: Workflow for `User -> Request Payout -> Admin Approve -> Update Ledger`.

### 4. Organization (Multi-tenancy)
- **Tenant Scope Middleware**: Every request identifies `org_id` from headers/token.
- `GET /org/reports`: Aggregated stats (Total Students, Courses, Active Teachers).

## Security
- **RBAC**: 
  - `Admin`: Full access.
  - `Staff`: Marketing and Support access.
  - `Organization`: Manage their own users/content.
  - `Teacher`: Manage their own courses.
  - `Student`: Read/Purchase access.
- **Rate Limiting**: Applied to login and coupon validation endpoints to prevent brute force.
