# Database Schema

## Tables

### `public.profiles`
Stores public user information. This table is linked 1:1 with `auth.users`.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary Key. References `auth.users(id)`. |
| `email` | `text` | User's email address. |
| `full_name` | `text` | User's display name. |
| `avatar_url` | `text` | URL to user's avatar image. |
| `updated_at` | `timestamptz` | Last update timestamp. |

## Automation & Triggers

To ensure data consistency between Supabase's internal Auth system and our public table, we use a PostgreSQL Trigger.

### Function: `public.handle_new_user()`
- **Triggered by**: `INSERT` on `auth.users`.
- **Action**: Automatically inserts a new row into `public.profiles` with the user's `id`, `email`, and metadata.
- **Security**: Defined as `security definer` to bypass RLS during execution (runs as database admin).

## Row Level Security (RLS) Policies

All tables have RLS enabled.

1.  **Select (Read)**: `true`
    - *anyone* can view profiles (Public).
2.  **Insert (Create)**: `auth.uid() = id`
    - Users can only create their own profile.
3.  **Update (Edit)**: `auth.uid() = id`
    - Users can only update their own profile.

## Setup Script
The initialization SQL script is located at: `root/SUPABASE_SETUP.sql`.
