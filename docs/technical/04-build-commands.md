# Build Commands

## Uploading this starter pack to GitHub

From your local machine:

```bash
git clone https://github.com/NucleusHQAI/Signal.git
cd Signal

# Copy the starter pack files into this folder, then:
git add .
git commit -m "Initialise SIGNAL product foundation"
git push origin main
```

## Recommended first app setup later

Only do this once the product scope is agreed.

```bash
npm create vite@latest signal-app -- --template react-ts
cd signal-app
npm install
npm run dev
```

Add the confirmed packages:

```bash
npm install recharts lucide-react @supabase/supabase-js
```

## Setting up Supabase

SIGNAL uses Supabase (Postgres + Auth) as the backend from Phase 1, not just for later cloud sync:

1. Create a free project at supabase.com.
2. Create one Postgres table per entity in `docs/technical/01-data-model.md`, with `user_id` referencing `auth.users.id` and row-level security enabled so each user can only read/write their own rows.
3. Store the project URL and anon key in a local `.env` file (not committed) and initialise the client with `@supabase/supabase-js`.

Do not start with wearable integrations until the local prototype, data model and rules engine are working.
