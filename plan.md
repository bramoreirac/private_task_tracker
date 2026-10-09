# Private Task Tracker — Implementation and Deployment Plan

## Goal

Build a small, real web application to understand frontend, backend, REST APIs, authentication, persistent storage, and deployment. The first screen is login. The finish line is a public HTTPS URL that works on a phone: sign in, create a task, refresh, and see it still there. A second account must have a separate task list.

## Instructions for Codex

Read this plan before implementation. Inspect the existing repository and AGENTS.md first; preserve existing work. Use this file as the implementation checklist and update its checkboxes as work completes. Explain each milestone briefly because this is a learning project. Implement incrementally and verify working behavior before proceeding. Use current stable dependencies and their official documentation; commit the lockfiles. Do not substitute Next.js for the separate React and Express applications.

This plan is project context, not a special initialization configuration. If using Codex /init to generate AGENTS.md, have it reference plan.md and preserve these requirements. Start implementation after reviewing the repository; ask only for missing account configuration or decisions that actually block progress. Never claim a deployment succeeded without testing its URL. Do not create paid resources without explicit authorization.

## Fixed stack

| Layer | Choice | Responsibility |
|---|---|---|
| Frontend | React + Vite, JavaScript | UI, forms, authentication session, API requests |
| Routing | React Router | Login, registration, protected dashboard |
| Backend | Express, JavaScript | REST routes, input validation, authentication checks |
| Runtime | Supported Node.js LTS | Local tooling and backend execution |
| API | REST over HTTPS, JSON | Explicit communication between React and Express |
| Authentication | Supabase Auth | Email/password accounts and session management |
| Database | Supabase PostgreSQL | Persistent tasks with row-level security |
| Hosting | Vercel Hobby frontend; Render Free backend | Two independently deployed applications |
| Source control | Git and GitHub | Reproducible source and deployment integration |

Use npm and simple CSS. Keep the architecture small: no Docker, ORM, custom password storage, queues, microservices, or elaborate design system for this MVP. Check current hosting plan terms before choosing resources; free-tier availability and limits may change.

## Mandatory zero-cost constraint

- Use **Vercel Hobby (free tier)** for the frontend and **Supabase Free** for both authentication and PostgreSQL.
- Use **Render Free** for the Express backend, subject to current availability. Do not select a paid instance.
- Do not enable paid upgrades, trials that automatically convert to paid plans, paid add-ons, or billable overages. Do not use a custom domain purchase; use the provider's included URL.
- Verify current free-plan eligibility and limits in official documentation before provisioning. Keep this personal learning project within those limits, including authentication email limits, database/storage quotas, and deployment usage.
- If a free-plan limit blocks progress, report it and propose a free alternative or reduced scope. Never silently upgrade or change the fixed stack.
- Document relevant observed free-tier behavior, such as backend cold starts or project inactivity pauses, in README.

## MVP behavior

- Register with email and password; show validation and provider errors clearly.
- Support the configured email-confirmation flow; explain when confirmation is needed.
- Log in, restore the session after refresh, and log out.
- Show a protected dashboard with the signed-in email.
- Create a task with a title; list newest first; mark complete/incomplete; delete.
- Show loading, empty, submitting, and error states. Prevent duplicate submissions.
- Use a responsive layout that works on desktop and phone.
- Keep each user's tasks private. Frontend route protection alone is insufficient.

Defer editing titles, due dates, search, notifications, social login, password-reset UI, teams, and analytics until the MVP is deployed.

## Request flow and ownership

1. React uses Supabase Auth to register/sign in and obtain a session.
2. React sends task requests to Express with `Authorization: Bearer <access_token>`.
3. Express verifies the token using the supported Supabase authentication API (for example, `auth.getUser(token)`), not merely by decoding it. Missing, invalid, or expired tokens return 401.
4. Express creates a request-scoped Supabase database client using the public/publishable key and that verified user's bearer token. Never mutate a shared client's authorization header across requests.
5. Express derives ownership from the verified user, validates input, and queries Supabase. PostgreSQL row-level security enforces ownership as a second boundary.
6. Express returns JSON; React updates the screen.

All task operations must pass through Express. The frontend uses Supabase directly only for authentication. Do not use a service-role/secret key for normal task requests; it can bypass row-level security. Do not accept `user_id` from request bodies as the source of identity.

## Database migration

Create a versioned SQL migration under `supabase/migrations/` defining:

```sql
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index tasks_user_created_idx on public.tasks(user_id, created_at desc);
alter table public.tasks enable row level security;

create policy tasks_select_own on public.tasks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy tasks_insert_own on public.tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy tasks_update_own on public.tasks
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy tasks_delete_own on public.tasks
  for delete to authenticated using ((select auth.uid()) = user_id);
```

Confirm the authenticated role has the required table privileges in the target project. Anonymous users must not access tasks. Run this migration once against the chosen project and record the setup instructions; do not reset an existing database.

## API contract

| Method | Endpoint | Input | Success |
|---|---|---|---|
| GET | /api/health | None; public | 200 `{ "status": "ok" }` |
| GET | /api/tasks | Bearer token | 200 `{ "tasks": [...] }` |
| POST | /api/tasks | `{ "title": "Study SQL" }` | 201 `{ "task": {...} }` |
| PATCH | /api/tasks/:id | `{ "completed": true }` | 200 `{ "task": {...} }` |
| DELETE | /api/tasks/:id | Bearer token | 204, empty body |

Return errors as `{ "error": { "code": "...", "message": "..." } }`. Use 400 for invalid bodies/UUIDs, 401 for invalid authentication, 404 for a missing or other user's task, and 500 for unexpected failures. Do not disclose whether another user's task exists. Trim titles, enforce 1–200 characters, require a boolean for completion, and reject unsupported mutation fields. Handle DELETE's empty response correctly on the frontend.

## Suggested repository

```text
/
  plan.md
  README.md
  .gitignore
  frontend/
    package.json
    package-lock.json
    .env.example
    src/
      pages/
      components/
      lib/                 # Supabase auth client and Express API client
  backend/
    package.json
    package-lock.json
    .env.example
    src/
      app.js               # Express setup, export for API tests
      server.js            # Listen on configured PORT
      middleware/
      routes/
      lib/
    tests/
  supabase/
    migrations/
```

## Environment configuration

Frontend `.env.example`:

```dotenv
VITE_API_BASE_URL=http://localhost:3001
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
```

Backend `.env.example`:

```dotenv
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
```

Use placeholder values only in examples. Vite variables are public and embedded at build time; never put secrets in them. Supabase public keys are intended for this use and require correct RLS policies. Ignore `.env` files while allowing `.env.example`. Do not log tokens, passwords, or environment secrets. Validate required configuration on backend startup.

Configure CORS for the exact frontend origin and allow the Authorization and Content-Type headers and required methods. Bearer-token task requests do not require cross-origin cookies. Bind the backend to `0.0.0.0` and the host-provided PORT. Use a modest JSON body limit and safe server error responses.

## Milestones

### 1. Scaffold and connect

- [x] Inspect repository instructions and available tools.
- [x] Create the React/Vite frontend and Express backend.
- [x] Add npm scripts for frontend development/build and backend development/start.
- [x] Add environment examples, gitignore, and basic README.
- [x] Implement health endpoint and verify React can reach it locally.

Acceptance: two local processes run, and the browser receives the backend health response.

### 2. Database and authentication

- [x] Configure a Supabase Free project and apply the migration; confirm no paid add-ons are enabled.
- [x] Configure local authentication site URL/redirect URLs.
- [x] Build registration/login first, then protected dashboard and logout.
- [x] Handle email confirmation and session restoration after refresh.
- [x] Verify expired-session behavior and refresh failure.
- [x] Implement backend token verification and request-scoped database access.

Acceptance: sign in and refresh successfully; unauthenticated API calls return 401.

### 3. Task CRUD

- [x] Implement API routes and validation.
- [x] Build task form, list, completion toggle, and delete action.
- [x] Add loading, empty, and error states.
- [ ] Add responsive styling and verify the phone layout.
- [x] Verify persistence and account isolation.

Acceptance: a task survives reload; a second account cannot read, modify, or delete it.

### 4. Verification

- [ ] Add focused API tests for validation, authentication failures, and HTTP responses using an appropriate lightweight test setup.
- [x] Run a real integration check against a test Supabase project/account to verify RLS and ownership; mocks alone cannot prove isolation.
- [x] Run frontend production build and resolve failures.
- [x] Complete the manual acceptance checklist below.

Do not build a large test framework for this small project. Never use destructive test cleanup against unrelated data. If required credentials are unavailable, report which integration checks remain pending.

### 5. Deploy and verify online

- [x] Push source to the user's GitHub repository; ensure no credentials are committed.
- [x] Deploy backend on Render with backend root, appropriate npm install/start commands, environment values, and `/api/health` health check.
- [x] Verify the deployed backend health URL.
- [x] Deploy frontend on Vercel Hobby (free tier) with frontend root, `npm run build`, and `dist` output; confirm the selected plan.
- [x] Configure Vite production variables with the actual backend URL and Supabase public settings before building.
- [x] Configure Vercel SPA fallback so direct navigation/refresh of `/login`, `/register`, and `/dashboard` serves the app without intercepting real assets.
- [x] Set backend FRONTEND_ORIGIN to the actual frontend HTTPS origin and redeploy.
- [x] Configure Supabase production site URL and the exact confirmation redirect URLs used by the app; retain required localhost development redirects.
- [x] Test registration/confirmation, login, and task CRUD from the deployed frontend.
- [x] Verify on a phone using the public URL and test a second account.
- [x] Document actual frontend/backend URLs, configuration, and redeployment steps in README.

Use current official provider instructions for exact configuration. If account access blocks deployment, complete the code/build and supply exact dashboard steps and values needed from the user. Do not call local-only completion a finished deployment. Note any observed hosting cold starts or limits without promising permanent free hosting.

## Manual acceptance checklist

- [x] Signed-out visitors see login; protected dashboard redirects to login.
- [x] Registration and any configured email confirmation work online.
- [x] Invalid login displays a useful message.
- [x] Account A creates, completes, uncompletes, and deletes a task.
- [x] Refresh retains the session and saved tasks.
- [x] Empty/whitespace and overlong titles are rejected by the backend.
- [x] Missing/invalid bearer tokens return 401 for every task route.
- [x] Account B sees none of A's tasks.
- [x] B's direct PATCH/DELETE requests using A's task UUID return 404 and leave A's task unchanged.
- [x] Database requests using B's token cannot access A's rows; anonymous requests cannot access tasks.
- [x] Logout clears the dashboard; subsequent task requests require authentication.
- [x] Direct navigation and refresh of deployed dashboard URL work.
- [x] Public HTTPS URL works on a phone without localhost dependencies.

## Definition of done

The user can demonstrate a deployed authenticated app with persistent, isolated tasks. The repository contains reproducible setup, SQL migration, environment examples, and clear deployment instructions. Codex reports what was built, what checks actually passed, the live URLs, and any remaining blockers. UI polish is secondary to completing and understanding the browser → Express API → database flow.
