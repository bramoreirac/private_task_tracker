# Private Task Tracker

A learning project with a React/Vite frontend, an Express API, and Supabase authentication and PostgreSQL. See [plan.md](plan.md) for the application requirements.

## Local setup

Use a supported Node.js version and npm. In PowerShell, `npm.cmd` works even if the execution policy blocks `npm.ps1`.

The frontend is ready to run:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the localhost URL printed by Vite. The backend package is prepared; its server and health route are the next exercise. Once implemented, run it in a second terminal:

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

Copy each app's `.env.example` to a local `.env` when its configuration is needed. Enter real values only in local `.env` files or provider dashboards. `.env` files are ignored by Git. The `VITE_` variables are embedded in the frontend build and must contain only public values.
