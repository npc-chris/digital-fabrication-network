# Environment Setup Guide

This guide explains how to obtain the necessary API keys and configuration values for the Digital Fabrication Network backend.

## 1. Database (PostgreSQL)

You need a PostgreSQL database.
- **Local:** Install PostgreSQL and create a database named `digital_fabrication_network`.
- **Cloud:** Use a provider like Neon, Supabase, or AWS RDS.

**Variable:** `DATABASE_URL`
**Format:** `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

## 2. Redis

Redis is used for caching and WebSocket pub/sub.
- **Local:** Install Redis and run it on port 6379.
- **Cloud:** Use Upstash or AWS ElastiCache.

**Variable:** `REDIS_URL`
**Format:** `redis://HOST:PORT` (e.g., `redis://localhost:6379`)

## 3. Authentication (JWT)

Generate a strong random string for signing JSON Web Tokens.
You can generate one using the terminal: `openssl rand -base64 32`

**Variable:** `JWT_SECRET`

## 4. Google OAuth (Social Login)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Select **Web application**.
6. Add Authorized JavaScript origins: `http://localhost:3000` (Frontend URL)
7. Add Authorized redirect URIs: `http://localhost:4000/api/auth/google/callback` (Backend Callback URL)
8. Copy the **Client ID** and **Client Secret**.

**Variables:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

## 5. Email (SMTP)

You need an SMTP server to send emails (Welcome, Order Confirmation, etc.).

### Option A: Zoho Mail (Recommended for free custom domain email)
1. Sign up for Zoho Mail.
2. Go to Settings > Mail Accounts > SMTP.
3. Use `smtp.zoho.com` port `587`.

### Option B: Gmail
1. Enable 2-Step Verification in your Google Account.
2. Generate an **App Password** (Security > App passwords).
3. Use `smtp.gmail.com` port `587`.
4. Use your Gmail address as user and the App Password as password.

**Variables:**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

## 6. File Storage (AWS S3)

By default, the app uses local storage (`USE_S3=false`). To use AWS S3:

1. Log in to [AWS Console](https://aws.amazon.com/console/).
2. Go to **S3** and create a bucket (e.g., `dfn-uploads`).
3. Go to **IAM** and create a user with `AmazonS3FullAccess` (or a more restricted policy).
4. Generate **Access Keys** for this user.

**Variables:**
- `USE_S3=true`
- `AWS_REGION` (e.g., `us-east-1`)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
