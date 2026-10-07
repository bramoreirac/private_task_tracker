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
