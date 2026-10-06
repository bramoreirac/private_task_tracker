# Hands-on Guide — Private Task Tracker

## Learning contract for Codex

Read this file alongside plan.md. plan.md defines the product and architecture; this guide overrides its instruction to continue implementation autonomously. The primary goal is learning by doing, not having Codex deliver all the code.

Work one stage at a time. Explain what we are building and why, give me a small actionable task, and wait for my result before completing the learning-critical work. Do not implement later stages in the background. If I explicitly ask you to take over a step, do so and explain the result.

For each stage use this format:

1. **Purpose:** explain the concept in plain language.
2. **My task:** exact commands, file paths, or dashboard actions, with short explanations. Adapt commands to my actual shell (normally Windows PowerShell).
3. **Expected result:** what I should see and how to check it.
4. **Review:** inspect my work or ask for non-sensitive output; help diagnose failures.
5. **Checkpoint:** ask me to explain the connection between the layers in one or two sentences before moving on.

Give scaffolding, signatures, pseudocode, and small examples first. Let me write the central logic. Offer progressively stronger hints when needed, then a worked solution if I request it. Explain errors instead of replacing my whole implementation. Codex may handle repetitive boilerplate, configuration review, formatting, and focused tests after explaining their role.

Never request passwords, full access tokens, private keys, or unredacted .env contents in chat. Guide me to enter values locally or in the provider dashboard. Public Supabase configuration is not a secret, but avoid unnecessarily pasting it into conversation. Do not claim to have run checks without actually running them.

## Responsibilities

| Work | I do | Codex helps with |
|---|---|---|
| Local setup | Install tools, run commands, inspect output | Check prerequisites and explain commands |
| Architecture | Describe the request flow | Review my explanation and clarify boundaries |
| Core code | API handlers, validation, UI events, API calls | Provide hints, review, debug |
| Accounts | Sign in/create GitHub, Supabase, Vercel, Render accounts | Explain where to click and which settings to use |
| Credentials | Enter configuration in local files/dashboard | Create examples and check variable names without exposing values |
| Authentication | Confirm emails, use two test accounts | Implement/review integration and error handling |
| Database | Run and inspect migration in my project | Explain SQL and review RLS policies |
| Deployment | Configure first deployment and observe build logs | Give exact current settings and diagnose failures |
| Verification | Test browser, phone, refresh, two-user behavior | Run available checks and review evidence |

Account login, MFA/CAPTCHA, email confirmation, and any provider terms or billing decisions require my intervention when encountered. Codex can sometimes perform deployment through authorized tools or a CLI, but for the first deployment leave the key dashboard steps to me so I learn them. Never assume an account or integration is available.

## Stage 0 — Understand the route a request takes

**My task:** write this flow in my own words:

`React in browser → HTTPS request → Express on Node.js → Supabase PostgreSQL → JSON response → React update`

Explain separately that Supabase Auth issues the session and Express verifies the access token before accessing tasks. Vite is a development/build tool, not the production task API. npm runs tooling and scripts; Node.js executes JavaScript outside the browser.

**Checkpoint:** which code runs on my phone, and which code runs on a server?

## Stage 1 — Prepare the workspace

**My tasks:**

1. Create a project folder and place plan.md and guide.md in its root.
2. Check `node --version`, `npm --version`, and `git --version` in my terminal. Install a supported Node.js LTS or Git if missing.
3. Initialize Git if this is a new repository. Review the files before committing.
4. Ask Codex for the current Vite React scaffold command, run it inside the intended folder, and inspect the generated package.json.
5. Start the frontend using its npm development script and open the displayed localhost URL.
6. Create backend/ with a package.json, install Express and the minimal supporting dependencies, and choose a consistent JavaScript module style.

**Codex:** provide commands appropriate to my terminal, explain working-directory effects and package scripts, and prepare .gitignore and environment examples with placeholders. Never overwrite an existing project blindly.

**Expected result:** React runs locally; I can explain what `npm install` and `npm run dev` do.

## Stage 2 — Make the first API request

**My tasks:**

1. Write a minimal Express application with GET /api/health returning JSON.
2. Separate application setup from server startup, and listen on PORT with a local default of 3001.
3. Start the backend in a second terminal and open its health endpoint.
4. Add a frontend fetch call using VITE_API_BASE_URL; display the returned status.
5. Open browser developer tools, inspect the Network request, and identify URL, method, status, and response body.
6. Configure CORS for the frontend's actual localhost origin; understand why different ports create different origins.

**Codex:** give a route skeleton and fetch example if needed; let me connect them. Explain that CORS is a browser rule and does not authenticate requests.

**Expected result:** frontend and backend communicate. Stopping the backend produces a visible frontend error.

**Checkpoint:** why can the React development server work while the API request fails?

## Stage 3 — Create the database

**My tasks:**

1. Sign in to Supabase and create a **Free** project. Keep account credentials and the database password private.
2. Locate the project URL and public/publishable key. Put values in the relevant local .env files using the variable names in plan.md.
3. Review the tasks migration with Codex: primary key, foreign key, timestamps, title constraint, index, and RLS policies.
4. Save the migration in the repository and run it once through the provider's supported SQL workflow.
5. Inspect the tasks table and confirm RLS is enabled and ownership policies exist.

**Codex:** explain each SQL section before execution, check for existing schema before applying it, and verify required permissions. Do not reset unrelated data. Use public-key, user-token database access for task requests; do not simplify this with a service-role key.

**Checkpoint:** how is a row linked to its owner, and why do we need RLS as well as backend checks?

## Stage 4 — Authentication before the dashboard

**My tasks:**

1. Configure the local site URL and actual confirmation redirect route in Supabase Auth. Keep email confirmation behavior explicit.
2. Build login and registration forms first, using the Supabase client for auth.
3. Register account A, confirm its email if configured, and sign in.
4. Build session initialization, loading behavior, logout, and a protected dashboard.
5. Refresh and verify the session is restored.
6. Write the backend authentication middleware using Codex's skeleton: extract bearer token, verify with Supabase, attach verified identity, reject failure with 401.
7. Send that access token in frontend API requests without printing it in logs.

**Codex:** review token verification and cleanup of session listeners; explain refresh handling using the auth SDK. Do not treat a decoded JWT as verified or frontend hiding as authorization.

**Expected result:** login works; signed-out task API requests return 401.

**Checkpoint:** what is the difference between authentication and authorization here?

## Stage 5 — Implement one complete task flow

Build **create + list** first; do not write all routes at once.

**My tasks:**

1. Write GET /api/tasks using a request-scoped Supabase client and the verified user token.
2. Write POST /api/tasks: trim title, validate length/type, derive user_id from verified identity, insert, return 201.
3. Build the frontend title input and submit handler; disable repeated submission while pending.
4. Display saved tasks and retrieve them after refresh.
5. Inspect the requests in Network and the stored rows in Supabase.
6. Write PATCH completion toggle and DELETE next, following the API contract.
7. Handle validation, empty list, loading, and server errors. Handle DELETE 204 without trying to parse an empty JSON body.

**Codex:** review each handler before proceeding; provide a short validation example if needed. Ensure user ownership is never taken from the submitted body and a shared client's token cannot leak between users.

**Checkpoint:** trace one button click through the frontend, API, and database.

## Stage 6 — Verify the boundaries

**My tasks:**

1. Create account B in a separate browser profile or private window.
2. Confirm B sees no A tasks and can create its own tasks.
3. Using a local test tool guided by Codex, attempt B's PATCH/DELETE on an A task ID; expect 404 and no change to A's row. Keep bearer tokens local.
4. Test missing/invalid tokens, blank/overlong titles, logout, and refresh.
5. Verify direct database requests with B's token cannot access A's rows and anonymous access cannot read tasks.
6. Run the frontend production build and review any errors.

**Codex:** add focused API tests where useful, help run integration checks safely, and explain why mocked tests cannot prove real RLS. Record passed versus pending checks honestly.

## Stage 7 — Deploy the backend

**My tasks:**

1. Create a GitHub repository, inspect staged changes for accidental .env files, then commit and push source. Ask Codex for commands matching my repository and shell.
2. Sign in to Render and connect the repository with the permissions actually needed.
3. Select a **Free** web service for backend/. Verify current availability and terms. If no free option fits, stop this step and discuss a free alternative.
4. Configure the backend root, appropriate dependency install command (normally npm ci with a lockfile), npm start, and /api/health health check.
5. Enter backend environment values privately. Ensure the app binds 0.0.0.0 and honors the provider's PORT; do not force a local port on the host.
6. Deploy, read the build/start logs, and open the actual HTTPS health endpoint.

**Codex:** explain the difference between install/build/start, review logs with secrets redacted, and help diagnose failures. Do not advance until the hosted backend responds.

**Checkpoint:** what has moved from my laptop to Render?

## Stage 8 — Deploy the frontend

**My tasks:**

1. Sign in to Vercel, select **Hobby**, and import the repository.
2. Set frontend/ as the root, Vite as the framework, npm run build as the build command, and dist as output, adapting to current provider guidance.
3. Enter VITE_API_BASE_URL using the deployed backend HTTPS URL and the public Supabase configuration. These values are embedded during the build.
4. Review the SPA fallback configuration with Codex so direct route refresh works while assets still resolve.
5. Deploy and record the actual frontend URL.
6. Update backend FRONTEND_ORIGIN to that exact origin and redeploy it.
7. Update Supabase production site URL and required email-confirmation redirect URLs; keep the development URLs needed locally.
8. Test the complete app at its hosted address.

**Codex:** use current official documentation for dashboard settings. Explain that changing Vite variables requires a new frontend build. Never expose server secrets through VITE_ variables.

**Checkpoint:** why can a deployment build succeed while login or API requests still fail?

## Stage 9 — Demonstrate and document

**My tasks:**

1. Open the public frontend URL on my phone, log in, create a task, refresh, toggle completion, and delete it.
2. Recheck account isolation online using two accounts.
3. Refresh /dashboard directly to verify routing.
4. Write a short README section explaining the architecture and how to redeploy after a code change.
5. Explain which settings belong to Vercel, Render, and Supabase.

**Codex:** review the explanation, finish the acceptance checklist in plan.md, and report real live URLs and unresolved issues. Mention observed free-tier limitations such as cold starts; do not promise unlimited or permanent free hosting.

## Cost rule throughout

Vercel Hobby + Supabase Free + Render Free only. No paid upgrades, billable add-ons, auto-converting trials, or domain purchases. Check current free-plan eligibility and limits before selecting resources. If blocked, discuss a free alternative rather than upgrading automatically.

## Starter prompt for Codex

> Read plan.md and guide.md before doing anything. guide.md defines our learning workflow and overrides autonomous implementation instructions in plan.md. I want to learn by practicing. Guide me one stage at a time, leave the key coding and first deployment actions to me, give clear commands and expected results, review my work, and wait before advancing. Start by checking my repository and tools, then guide me through stage 0 and stage 1. Use only the specified free tiers. Handle repetitive scaffolding when useful, but do not build the entire app for me unless I explicitly ask.
