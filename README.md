# Private Task Tracker

A learning project with a React/Vite frontend, an Express API, and Supabase authentication and PostgreSQL. See [plan.md](plan.md) for the application requirements.

## Local setup

Use a supported Node.js version and npm. In PowerShell, `npm.cmd` works even if the execution policy blocks `npm.ps1`.

Copy `frontend/.env.example` to `frontend/.env` and `backend/.env.example` to
`backend/.env`, then fill in the local values. Real values belong only in local
`.env` files or provider dashboards. `.env` files are ignored by Git. The
`VITE_` variables are embedded in the frontend build and must contain only
public values.

Start the backend in one terminal:

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the localhost URL printed by Vite. The backend health endpoint is
`http://localhost:3001/api/health` by default.

## Hosted backend

Render service: https://private-task-tracker.onrender.com

Health endpoint: https://private-task-tracker.onrender.com/api/health

## Deployment

Frontend: https://private-task-tracker.vercel.app/

Backend: https://private-task-tracker.onrender.com

Health check: https://private-task-tracker.onrender.com/api/health

React uses Supabase Auth for sign-in, then sends task requests with the access
token to Express. Express verifies the token and queries Supabase PostgreSQL.
Row-level security limits each account to its own tasks. Express returns JSON
and React updates the page. A task UUID identifies a row; it does not grant
permission to change that row.

- **Vercel:** Root directory `frontend`, Vite build command `npm run build`,
  output directory `dist`. Set `VITE_API_BASE_URL` to the Render HTTPS base URL,
  plus `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the public
  Supabase project values. `frontend/vercel.json` serves the React app on direct
  visits to `/login`, `/register`, and `/dashboard`.
- **Render:** Root directory `backend`, install dependencies with `npm ci`, and
  start with `npm start`. Set `FRONTEND_ORIGIN` to the exact Vercel HTTPS origin,
  plus `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Render provides `PORT`.
- **Supabase:** In Authentication URL Configuration, set the Site URL to the
  Vercel URL and allow the exact `/login` confirmation redirect. Keep the
  localhost redirect for development. The `tasks` migration and RLS policies
  are in `supabase/migrations/`.

After a change is pushed to `main`, the connected hosts deploy it if automatic
deploys are enabled; otherwise, start a deployment in each host's dashboard.
Changing a `VITE_*` value in Vercel requires a new frontend deployment because
Vite embeds that value during the build. Keep real environment values in local
`.env` files and provider settings, never in commits.
