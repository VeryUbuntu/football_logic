# Authentication Flow Documentation

## Overview
The application uses a **Passwordless Email OTP** (One-Time Password) system. Users enter their email, receive a 6-digit code, and log in. There are no passwords to remember.

## Components
1.  **Supabase Auth**: Manages users, sessions, and tokens.
2.  **Resend**: Acts as the SMTP provider for Supabase to ensure high deliverability of emails.
3.  **Middleware**: Protects routes and manages session refreshing.

## logic Implementation (`/app/login/page.tsx`)

### 1. Sending the Code
- **Function**: `signInWithOtp`
- **Config**: `{ shouldCreateUser: true }`
- **Behavior**:
    - If user exists -> Sends "Magic Link" template (Login).
    - If user is new -> Sends "Confirmation" template (Signup).
    - *Note*: Both templates must be configured in Supabase to include `{{ .Token }}`.

### 2. Verifying the Code
To provide a seamless "one-box" experience for both login and registration, the verification logic is resilient:

1.  **Attempt 1 (Login)**: Tries to verify with `type: 'email'`.
    - This works for existing users logging in.
2.  **Attempt 2 (Signup)**: If Attempt 1 fails, catches the error and tries `type: 'signup'`.
    - This works for new users verifying their email for the first time.

### 3. Session Management
- **Middleware** (`middleware.ts`): Runs on every request (except static assets). It calls `updateSession` to refresh Supabase Auth tokens if they are close to expiring.
- **Client Side**: Uses `createBrowserClient`.
- **Server Side**: Uses `createServerClient` with cookie handling.

## Configuration Requirements
- **Env Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `RESEND_API_KEY` (Used in Supabase Dashboard, not directly in app code usually, unless using Resend SDK directly).
- **Supabase Settings**:
  - **Email Provider**: Custom SMTP enabled.
  - **Host**: `smtp.resend.com`
  - **User**: `resend`
  - **Pass**: `[RESEND_API_KEY]`
