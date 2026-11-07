# Monthly Cashflow Calculator

Single-page calculator (`index.html`). Inputs and saved snapshots are stored in the **Intintus** backend (same account as Int2.0) under `/cashflow/*`.

- Sign in with your Intintus email/password; inputs autosave to `PUT /cashflow/state`.
- **Snapshots** save the current numbers + computed results. Load one to edit it, then **Update snapshot** to overwrite it; rename or delete from the list.
- Values left in the old `localStorage` key (`cashflow-calculator-v4`) are uploaded once on first sign-in, then cleared.

## Netlify

Publish directory is the repo root (`netlify.toml`). The `/api/*` edge function proxies to the backend so auth cookies stay first-party.

Site env: `INTINTUS_BACKEND_URL=https://habittrackerpythonbackend.onrender.com` (defaults to that if unset).
