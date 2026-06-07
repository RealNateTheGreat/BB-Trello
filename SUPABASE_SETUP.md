# Broken Blade Supabase Setup

1. Create a Supabase project.
2. Add these values to `.env`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_OWNER_DISCORD_ID=210768103594917888
VITE_DISCORD_INVITE_URL=https://discord.gg/8QeE9RPtcA
```

3. In Supabase Auth, enable the Discord provider.
4. In the Discord Developer Portal, create an OAuth2 app and add this redirect URL:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

5. Put the Discord Client ID and Client Secret in Supabase Dashboard, not in the Vite `.env` file.
6. In Supabase Auth URL Configuration, add your app redirect URLs, including local development:

```text
http://localhost:5173/**
http://127.0.0.1:5173/**
```

7. Apply the migrations in `supabase/migrations`.
8. Sign in once with the owner Discord account.

The owner Discord ID is built in as `Web Owner` with full permissions. Other users should be added from the Management tab by Discord user ID, then they can sign in with Discord and automatically receive the saved rank.

## Roles

- `Web Owner`: built-in for Discord user ID `210768103594917888`, full permissions.
- `Broken Blade Staff`: full permissions.
- `Web Admin`: full permissions.
- `Web Mod`: add, edit, and delete content boards, categories, and posts.

Full-permission users can add Discord user IDs and assign ranks below their own rank. `Web Owner` is not assignable from the dashboard.

## Tables Used

- `users`: Discord profiles and permission data.
- `user_invites`: pending Discord ID permission grants.
- `categories`: content boards.
- `pages`: posts inside boards.
- `credits`: public credits page entries. Discord IDs/emails are stored only for linking and are not displayed publicly.
- `announcements`: announcement modal content.
- `web_logos`: optional active banner/loading/favicon/logo URLs.

## Storage

The migration creates a public `avatars` bucket for uploaded avatars, credit icons, and content images.
