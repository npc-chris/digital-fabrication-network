# DFN Platform - Remaining Implementation Guide

This document outlines the implementation details for the remaining features to complete the DFN platform finalization.

## Completed Features ✅

### Backend Infrastructure
- [x] Search functionality across all platform entities (components, services, posts, users)
- [x] Notifications system with database schema and API endpoints
- [x] Quotes system for service requests with approval workflow
- [x] Google OAuth authentication integration
- [x] WebSocket server for real-time messaging
- [x] File upload with AWS S3 integration
- [x] Email notification service with Nodemailer templates
- [x] All API routes properly configured and built

### Frontend Pages
- [x] Landing page with hero, features, and CTA sections
- [x] Pricing page with plan comparison and FAQ
- [x] About Us page with mission, story, and values

## Remaining Implementation Tasks

### 1. Admin Dashboard & Roles

#### Backend Changes
Update `backend/src/models/schema.ts`:
```typescript
// Add admin role to enum
export const userRoleEnum = pgEnum('user_role', [
  'explorer', 
  'provider', 
  'provider', 
  'explorer',
  'admin',
  'platform_manager'
]);
```

Create `backend/src/routes/admin.routes.ts`:
- GET `/api/admin/users` - List all users with pagination
- PATCH `/api/admin/users/:id/role` - Update user role
- PATCH `/api/admin/users/:id/status` - Activate/deactivate users
- GET `/api/admin/statistics` - Platform statistics dashboard
- GET `/api/admin/orders` - View all orders
- GET `/api/admin/bookings` - View all bookings
- PATCH `/api/admin/orders/:id/status` - Update order status
- PATCH `/api/admin/bookings/:id/status` - Update booking status

#### Frontend
Create `frontend/src/app/admin/` directory with:
- `page.tsx` - Admin dashboard with statistics
- `users/page.tsx` - User management
- `orders/page.tsx` - Order management
- `bookings/page.tsx` - Booking management
- `services/page.tsx` - Service approval/management

### 2. Payment Processing Integration

#### Install Payment SDKs
```bash
cd backend
npm install stripe paystack @paystack/inline-js kora-js interswitch-webpay
```

#### Create Payment Service
File: `backend/src/services/payment.service.ts`

```typescript
export class PaymentService {
  // Stripe integration
  async createStripePayment(amount, currency, metadata) { }
  async verifyStripePayment(paymentIntentId) { }
  
  // Paystack integration
  async initializePaystackPayment(amount, email, metadata) { }
  async verifyPaystackPayment(reference) { }
  
  // Kora integration
  async createKoraCharge(amount, currency, customer) { }
  async verifyKoraPayment(chargeId) { }
  
  // Interswitch integration
  async initializeInterswitchPayment(amount, customerId) { }
  async verifyInterswitchPayment(transactionId) { }
}
```

#### Payment Routes
File: `backend/src/routes/payments.routes.ts`

- POST `/api/payments/initialize` - Initialize payment with selected processor
- POST `/api/payments/verify` - Verify payment completion
- GET `/api/payments/:id` - Get payment details
- GET `/api/payments/user` - Get user payment history
- POST `/api/payments/webhook/stripe` - Stripe webhook
- POST `/api/payments/webhook/paystack` - Paystack webhook
- POST `/api/payments/webhook/kora` - Kora webhook
- POST `/api/payments/webhook/interswitch` - Interswitch webhook

#### Frontend Payment Components
Create `frontend/src/components/PaymentModal.tsx`:
- Payment processor selection
- Card input form
- Payment confirmation

### 3. Testing

#### Backend Tests
Create test files in `backend/src/__tests__/`:

**Unit Tests:**
- `auth.service.test.ts` - Authentication logic
- `email.service.test.ts` - Email sending
- `storage.service.test.ts` - File upload/download
- `payment.service.test.ts` - Payment processing

**Integration Tests:**
- `auth.routes.test.ts` - Auth endpoints
- `components.routes.test.ts` - Components CRUD
- `services.routes.test.ts` - Services CRUD
- `orders.routes.test.ts` - Order flow
- `bookings.routes.test.ts` - Booking flow
- `quotes.routes.test.ts` - Quote requests
- `notifications.routes.test.ts` - Notifications
- `search.routes.test.ts` - Search functionality

Example test setup:
```typescript
import request from 'supertest';
import app from '../index';

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'explorer'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });
});
```

#### Frontend Tests
Create test files in `frontend/src/__tests__/`:
- `components/` - Component unit tests
- `pages/` - Page rendering tests
- `integration/` - User flow tests

### 4. API Documentation (Swagger/OpenAPI)

#### Install Swagger
```bash
cd backend
npm install swagger-jsdoc swagger-ui-express @types/swagger-ui-express
```

#### Setup Swagger
File: `backend/src/config/swagger.ts`

```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Digital Fabrication Network API',
      version: '1.0.0',
      description: 'Complete API documentation for DFN platform',
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development' },
      { url: 'https://api.dfn.com', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

Add to `backend/src/index.ts`:
```typescript
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### 5. Monitoring & Error Tracking

#### Install Sentry
```bash
cd backend
npm install @sentry/node @sentry/tracing

cd ../frontend
npm install @sentry/react @sentry/tracing
```

#### Backend Monitoring
File: `backend/src/config/sentry.ts`

```typescript
import * as Sentry from '@sentry/node';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
};
```

#### Frontend Monitoring
File: `frontend/src/lib/sentry.ts`

```typescript
import * as Sentry from '@sentry/react';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
};
```

### 6. Production Deployment

#### Vercel (Frontend)
1. Connect GitHub repository to Vercel
2. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SENTRY_DSN`
3. Deploy automatically on push to main

#### Railway (Backend)
1. Connect GitHub repository to Railway
2. Configure environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
   - `STRIPE_SECRET_KEY`
   - `PAYSTACK_SECRET_KEY`
   - `KORA_SECRET_KEY`
   - `INTERSWITCH_SECRET_KEY`
   - `SENTRY_DSN`
3. Run database migrations
4. Deploy automatically on push to main

### Environment Variables Summary

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### Backend (.env)
```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/dfn
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=dfn-uploads
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
STRIPE_SECRET_KEY=sk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
KORA_SECRET_KEY=sk_test_xxx
INTERSWITCH_SECRET_KEY=sk_test_xxx
SENTRY_DSN=your-sentry-dsn
REDIS_URL=redis://localhost:6379
```

## Priority Implementation Order

1. **Admin Dashboard** (High Priority)
   - Create admin role in schema
   - Build admin routes
   - Create admin UI pages

2. **Payment Processing** (High Priority)
   - Integrate all 4 payment processors
   - Add webhook handlers
   - Create payment UI components

3. **Testing** (Medium Priority)
   - Write unit tests for critical services
   - Add integration tests for main flows
   - Set up test automation

4. **API Documentation** (Medium Priority)
   - Set up Swagger
   - Document all endpoints
   - Add authentication examples

5. **Monitoring** (Medium Priority)
   - Set up Sentry
   - Add logging
   - Configure alerts

6. **Deployment** (Final Step)
   - Configure production environments
   - Set environment variables
   - Deploy and test

## Notes
- All backend features are implemented and building successfully
- Frontend pages (Landing, Pricing, About) are complete
- Database schema includes notifications, quotes tables
- WebSocket server is configured for real-time messaging
- File upload is integrated with AWS S3
- Email service is ready with templates
- Google OAuth is fully configured
