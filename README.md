# Nova Chat — Frontend

Next.js 14 (App Router) client. Dark, premium UI with real-time messaging over Socket.IO.

## 1. Install

```bash
cd frontend
npm install
```

## 2. Configure environment

```bash
cp .env.local.example .env.local
```

Point it at your running backend:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## 3. Run

Make sure the backend (see `../backend/README.md`) is running first, then:

```bash
npm run dev
```

Visit `http://localhost:3000`. You'll land on `/login` until you sign up.

## What's implemented

- **Auth** — signup/login forms with live password-strength + username validation, silent token refresh on reload, protected `/chat` route
- **Nova ID** — every account gets a unique 10-digit ID, shown as a glowing mono-spaced badge, copyable, searchable from Add Friend
- **Friends** — search by username or Nova ID, send/accept/decline/cancel requests, remove friend, block user
- **Messaging** — real-time send/receive, optimistic send with pending/failed states, image sharing (drag in via the 📎 button), reply-to with jump-to-message, edit (shows "edited"), soft delete (shows "Message deleted")
- **Reactions** — quick emoji bar on hover, toggled per-user, grouped counts
- **Typing indicators** — live per-conversation, debounced
- **Presence** — online/offline dot, "last seen" text, updates live across all open friend lists
- **Read receipts** — double-tick, turns amber when read
- **Profile** — avatar upload (Cloudinary), display name/bio editing, password change, logout
- **Responsive** — collapses to a single-pane mobile layout with a bottom-ish tab bar and back navigation, matches the spec's breakpoints

## Notes on the build in this environment

This was built and build-verified inside a sandboxed container that blocks `fonts.googleapis.com`,
so the production `next/font/google` fetch couldn't be tested end-to-end here — that's a network
policy of the build sandbox, not a bug. It will fetch normally the moment you run `npm run build`
or `npm run dev` on your own machine or CI, where Google Fonts is reachable. Everything else
(routing, all `@/` imports, ESLint, full production build/static generation) was verified clean.

## Deploying later

1. Set `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` to your deployed backend's URL.
2. `npm run build && npm start`, or deploy directly to Vercel (it's a standard Next.js app — no
   special config beyond the env vars above).
3. Make sure your backend's `CLIENT_URL` env var matches wherever this frontend ends up deployed,
   so CORS and cookies work.
