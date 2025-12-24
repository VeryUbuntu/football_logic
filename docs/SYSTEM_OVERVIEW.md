# Football Logic - System Overview

## Project Goal
A robust soccer analysis platform with a secure and modern authentication system.

## Technology Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, `lucide-react` for icons, `sonner` for toast notifications.
- **State Management**: React Hooks (Standard)
- **Theme**: Dark Mode support via `next-themes` (Class-based).

## Infrastructure & Backend
- **Authentication**: Supabase Auth (SSR)
    - **Method**: Passwordless Email OTP (6-digits).
    - **Provider**: Emails delivered via Resend SMTP integration.
- **Database**: Supabase (PostgreSQL)
    - **Tables**: `profiles` (Synced with `auth.users`).

## Project Structure
```
football_logic/
├── app/
│   ├── auth/           # Auth related routes (callbacks)
│   ├── login/          # Login page with OTP flow
│   ├── page.tsx        # Protected Dashboard (Home)
│   ├── layout.tsx      # Root layout with Providers
│   └── globals.css     # Global styles & Tailwind Setup
├── components/
│   └── ui/             # Reusable UI components (Button, Input, OTP)
├── utils/
│   └── supabase/       # Supabase clients (Server, Client, Middleware)
├── SUPABASE_SETUP.sql  # Database initialization scripts
└── docs/               # Project documentation
```
