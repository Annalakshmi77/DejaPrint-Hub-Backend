# PrintCraft API — NestJS + MongoDB

## Prerequisites
- Node.js 18+
- MongoDB running on localhost:27017

## Setup

```bash
npm install
cp .env.example .env
# Edit .env — MongoDB URI is already set to localhost
```

## Run

```bash
# Development (hot reload)
npm run start:dev

# Production build
npm run build && npm run start
```

## API
- Base URL: http://localhost:5000/api
- Swagger docs: http://localhost:5000/api/docs

## Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/auth/register | - | Register |
| POST | /api/auth/login | - | Login |
| POST | /api/auth/refresh | - | Refresh token |
| POST | /api/auth/logout | ✅ | Logout |
| GET | /api/auth/me | ✅ | Get profile |
| GET | /api/products | - | List products |
| GET | /api/products/:id | - | Product detail |
| GET | /api/products/categories | - | Categories |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| POST | /api/orders | ✅ | Place order |
| GET | /api/orders | ✅ | My orders |
| GET | /api/orders/:id | ✅ | Order detail |
| POST | /api/orders/:id/cancel | ✅ | Cancel order |
| POST | /api/payments/initiate | ✅ | Start payment |
| POST | /api/payments/verify | ✅ | Verify payment |
| POST | /api/payments/webhook | - | Razorpay webhook |
| POST | /api/designs/orders/:oid/items/:iid | ✅ | Upload design |
| GET | /api/admin/dashboard | Admin | Dashboard stats |
| GET | /api/admin/orders | Admin | All orders |
| PUT | /api/admin/orders/:id/status | Admin | Update status |
| GET | /api/admin/designs/pending | Admin | Pending designs |
| PUT | /api/admin/designs/:id/review | Admin | Review design |

## MongoDB Connection
Uses `mongodb://localhost:27017/printcraft` by default.
No authentication required for local development.

## Seed admin user (optional)
```js
// Run in MongoDB shell or Compass
db.users.insertOne({
  name: "Admin",
  email: "admin@printcraft.com",
  passwordHash: "$2a$12$...",  // bcrypt hash of your password
  phone: "9999999999",
  role: "admin",
  emailVerified: true,
  addresses: [],
  createdAt: new Date()
})
```
