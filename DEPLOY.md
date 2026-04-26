# Deployment Guide

Oracle Desk deploys as three services: backend (Railway), PostgreSQL (Railway), Redis (Railway), and frontend (Vercel). Total estimated cost at idle: ~$10/mo.

---

## Prerequisites

- [Railway account](https://railway.app) (Hobby plan, $5/mo)
- [Vercel account](https://vercel.com) (free tier sufficient)
- GitHub repo connected to both platforms
- All required API keys (Anthropic, Kalshi, Clerk, Stripe optional)

---

## 1. Railway: Backend + Database + Redis

### 1a. Create a new Railway project

1. Go to [railway.app](https://railway.app) and click **New Project**.
2. Select **Deploy from GitHub repo** and connect `AllStreets/OracleDesk`.
3. Railway will detect the `backend/Dockerfile` automatically.

### 1b. Add PostgreSQL

1. In your Railway project, click **+ New** and select **Database > Add PostgreSQL**.
2. Railway provisions a managed Postgres instance and exposes `DATABASE_URL` as a variable.
3. In your backend service settings, add the reference variable:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
   Railway interpolates this at runtime using the internal network address.

### 1c. Add Redis

1. Click **+ New** and select **Database > Add Redis**.
2. Redis is provisioned with auth enabled by default.
3. Add the reference variable to your backend service:
   ```
   REDIS_URL=${{Redis.REDIS_URL}}
   ```

### 1d. Configure backend environment variables

In the backend service **Variables** tab, add:

```
ANTHROPIC_API_KEY=sk-ant-...
KALSHI_API_KEY=...
SECRET_KEY=<random 32+ char string>
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...          (optional, for billing)
STRIPE_WEBHOOK_SECRET=whsec_...       (optional)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

Generate a secure `SECRET_KEY`:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 1e. Set the root directory

In the backend service **Settings** tab:
- **Root Directory:** `backend`
- **Build Command:** (leave blank, uses Dockerfile)
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Railway injects `$PORT` automatically.

### 1f. Run database migrations

After the first successful deploy, open the Railway shell for the backend service and run:

```bash
alembic upgrade head
```

Or add a **Deploy Hook** (Settings > Deploy Hooks) that runs migrations before the new container goes live:

```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Replace the start command with the above to run migrations on every deploy. This is safe because Alembic is idempotent.

### 1g. Verify backend

Once deployed, Railway shows a public URL like `https://oracledesk-backend-production.up.railway.app`. Test it:

```bash
curl https://your-railway-url/health
# Expected: {"status":"ok"}
```

---

## 2. Vercel: Frontend

### 2a. Import project

1. Go to [vercel.com](https://vercel.com) and click **Add New > Project**.
2. Select the `AllStreets/OracleDesk` repository.
3. Set **Root Directory** to `frontend`.
4. Vercel auto-detects Vite.

### 2b. Configure environment variable

In **Settings > Environment Variables**, add:

```
VITE_API_URL=https://your-railway-url
```

Replace `your-railway-url` with the Railway backend URL (no trailing slash).

### 2c. Deploy

Click **Deploy**. Vercel builds with `npm run build` and serves `dist/`. Subsequent pushes to `main` auto-deploy.

### 2d. Custom domain (optional)

In **Settings > Domains**, add your custom domain and follow Vercel's DNS instructions.

---

## 3. CORS Configuration

After deploying the frontend, update the backend's CORS allowed origins. In `backend/app/main.py`:

```python
allow_origins=["http://localhost:5173", "https://your-vercel-url.vercel.app", "https://yourdomain.com"],
```

Redeploy the backend after this change.

---

## 4. Stripe Webhooks (optional, for billing)

1. In the Stripe dashboard, go to **Developers > Webhooks**.
2. Add endpoint: `https://your-railway-url/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` on Railway.

---

## 5. Post-Deploy Checklist

- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] `POST /api/auth/signup` returns `access_token`
- [ ] Frontend loads at Vercel URL, login redirects to `/dashboard`
- [ ] `GET /api/dashboard` returns `[]` (no contracts yet)
- [ ] Wait 15 minutes for first contract sync to run, then refresh dashboard
- [ ] Set up Kalshi API key with read access to market data
- [ ] Verify APScheduler logs show `contract_sync` and `price_recorder` jobs starting

---

## 6. Monitoring and Logs

- **Railway:** Logs available in the service panel. Filter for APScheduler job logs to confirm sync is running.
- **Cost tracking:** All Claude API calls are logged to the `api_cost_logs` table with token counts and USD cost.
- **Redis:** Used for rate limiting. Check Railway Redis metrics for connection health.

---

## Environment Variable Reference

| Variable | Where Set | Notes |
|----------|-----------|-------|
| `ANTHROPIC_API_KEY` | Railway backend | Required for all agent calls |
| `KALSHI_API_KEY` | Railway backend | Kalshi account API settings |
| `DATABASE_URL` | Railway backend | Reference `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | Railway backend | Reference `${{Redis.REDIS_URL}}` |
| `SECRET_KEY` | Railway backend | JWT signing key, 32+ chars |
| `CLERK_SECRET_KEY` | Railway backend | Clerk dashboard > API Keys |
| `CLERK_PUBLISHABLE_KEY` | Railway backend | Clerk dashboard > API Keys |
| `STRIPE_SECRET_KEY` | Railway backend | Stripe dashboard > Developers |
| `STRIPE_WEBHOOK_SECRET` | Railway backend | Stripe dashboard > Webhooks |
| `VITE_API_URL` | Vercel frontend | Railway backend public URL |
