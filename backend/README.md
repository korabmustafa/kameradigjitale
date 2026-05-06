# Kameradigjitale Backend (NestJS + Prisma + PostgreSQL)

Production-style backend aligned with the frontend catalog, checkout, and admin flows.

## 1) What this backend provides
- Versioned REST API: `http://localhost:4000/api/v1`
- PostgreSQL persistence via Prisma
- Catalog product listing and detail
- Navigation menu from DB
- Order creation with stock decrement in a DB transaction
- Customer order-number lookup for order status
- Optional SMTP order-confirmation emails
- Password-protected admin endpoints for product, navigation, order, and user management

## 2) API endpoints
- `GET /health`
- `GET /products?category=&q=&page=&limit=`
- `GET /products/:productCode`
- `GET /navigation/menu`
- `POST /auth/admin-login`
- `GET /orders` (admin bearer token required)
- `POST /orders`
- `POST /orders/lookup`
- `PATCH /orders/:id/status` (admin bearer token required)
- `GET /users/admin` (admin bearer token required)

## 3) Local setup (fool-proof)
### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL 15+

### Step A: Create database and user
```bash
psql -U postgres
```
Then run:
```sql
CREATE USER kd_app WITH PASSWORD 'change_this_password';
CREATE DATABASE kameradigjitale OWNER kd_app;
GRANT ALL PRIVILEGES ON DATABASE kameradigjitale TO kd_app;
```

### Step B: Configure environment
Create `backend/.env`:
```env
PORT=4000
DATABASE_URL=postgresql://kd_app:change_this_password@localhost:5432/kameradigjitale?schema=public
# Optional order-confirmation email delivery. Without SMTP_HOST, emails are logged as previews.
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
# Use true for providers that require STARTTLS on port 587.
SMTP_STARTTLS=false
SMTP_TIMEOUT_MS=10000
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=orders@kameradigjitale.com
# Used to include a direct order-status link in confirmation emails.
FRONTEND_URL=https://kameradigjitale.com
# Admin dashboard authentication. Use a long random token in production.
ADMIN_PASSWORD=change_this_admin_password
ADMIN_AUTH_TOKEN=replace_with_a_long_random_token
```

### Step C: Install deps and initialize DB
```bash
cd backend
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

### Step D: Run backend
```bash
npm run start:dev
```

Health check:
```bash
curl http://localhost:4000/api/v1/health
```

## 4) Frontend connection mapping
- Catalog page -> `GET /products`
- Product details -> `GET /products/:productCode`
- Nav menu -> `GET /navigation/menu`
- Checkout submit -> `POST /orders`
- Order status lookup -> `POST /orders/lookup`
- Admin dashboard -> `POST /auth/admin-login`, then bearer-authenticated `GET /orders`, `PATCH /orders/:id/status`, `GET /users/admin`, product mutations, and navigation mutations

### Admin smoke test
```bash
ADMIN_TOKEN=$(curl -s -X POST 'http://localhost:4000/api/v1/auth/admin-login' \
  -H 'Content-Type: application/json' \
  -d '{"password":"change_this_admin_password"}' | node -pe "JSON.parse(require('fs').readFileSync(0, 'utf8')).token")

curl 'http://localhost:4000/api/v1/orders' -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 5) Smoke tests
```bash
curl 'http://localhost:4000/api/v1/products?page=1&limit=12'
curl 'http://localhost:4000/api/v1/products/nikon-z6-ii'
curl 'http://localhost:4000/api/v1/navigation/menu'
```

Create order example (response includes `orderNumber`, which is sent by email when SMTP is configured):
```bash
curl -X POST 'http://localhost:4000/api/v1/orders' \
  -H 'Content-Type: application/json' \
  -d '{
    "customerName": "Alex Doe",
    "email": "alex@example.com",
    "phone": "+1-202-555-0110",
    "address": "123 Main St, Austin, TX",
    "items": [
      {"productCode": "nikon-z6-ii", "quantity": 1},
      {"productCode": "canon-ae1-program", "quantity": 1}
    ]
  }'
```

Look up an order by order number and checkout email:
```bash
curl -X POST 'http://localhost:4000/api/v1/orders/lookup' \
  -H 'Content-Type: application/json' \
  -d '{
    "orderNumber": "KD-20260506-ABC123",
    "email": "alex@example.com"
  }'
```

## 6) Troubleshooting
- **Prisma client errors**: run `npm run db:generate` again.
- **Migration fails**: verify `DATABASE_URL`, then run `npm run db:reset` (dev only).
- **Port in use**: set `PORT=4001` in `.env`.
- **No emails arrive**: verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_STARTTLS`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`. If `SMTP_HOST` is omitted, the backend logs an email preview instead of sending.
- **No menu/products**: run `npm run db:seed` again.

## 7) AWS move checklist
- Use `npm run db:deploy` in CI/CD for production migrations.
- Store `DATABASE_URL` in AWS Secrets Manager or SSM, not in code.
- Put NestJS behind an ALB/API Gateway and enable HTTPS only.
- Rotate `ADMIN_PASSWORD` and `ADMIN_AUTH_TOKEN` for production; use long random values stored in AWS Secrets Manager or SSM.
- Consider replacing the lightweight admin token with JWT sessions + RBAC if multiple admin roles need different permissions.
