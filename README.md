# Oracle Desk

Multi-agent prediction market research platform. Five Claude agents analyze Kalshi and Polymarket contracts in parallel, synthesize structured theses, and surface ranked mispricings through a dark-mode React dashboard.

---

## What It Does

1. **Ingests** live contracts from Kalshi and Polymarket every 15 minutes via background sync.
2. **Analyzes** each contract through a 5-agent pipeline: data ingestion, quantitative modeling, qualitative research, sentiment/contrarian, and synthesis.
3. **Ranks** contracts by expected value and surfaces them on a filterable dashboard.
4. **Tracks** price history hourly. Users can watchlist contracts and trigger on-demand re-analysis.

---

## Agent Pipeline

```
Contract data
      |
      v
[Agent 1: Data Ingestion]  ──── claude-haiku-4-5  ──── normalizes raw market data
      |
      |──────────────────────────────────────────────── (parallel asyncio.gather)
      |
      v                    v                      v
[Agent 2: Quant]    [Agent 3: Qualitative]  [Agent 4: Sentiment]
claude-sonnet-4-6   claude-sonnet-4-6       claude-sonnet-4-6
fair value model    thesis narrative        contrarian flags
      |                    |                      |
      └──────────────────────────────────────────┘
                           |
                           v
              [Agent 5: Synthesis]  ──── claude-opus-4-7
              final thesis + EV + confidence score
                           |
                           v
                  stored in PostgreSQL
```

All system prompts are cached via `cache_control: ephemeral`. Agents 1-4 run concurrently; Agent 5 runs sequentially after all four resolve. Target cost: under $0.50 per full pipeline run.

---

## Data Structure

```
OracleDesk/
├── backend/
│   ├── app/
│   │   ├── main.py                        # FastAPI app, CORS, lifespan scheduler
│   │   ├── config.py                      # pydantic-settings environment config
│   │   ├── database.py                    # async SQLAlchemy engine + session factory
│   │   │
│   │   ├── models/
│   │   │   ├── user.py                    # users: id, email, plan, hashed_password
│   │   │   ├── contract.py                # contracts: platform, title, prices, volume
│   │   │   ├── analysis.py                # analyses: thesis, fair_value, EV, JSONB outputs
│   │   │   ├── watchlist.py               # watchlists: user_id, contract_id, alert_threshold
│   │   │   ├── price_history.py           # price_history: yes/no prices, recorded_at
│   │   │   └── api_cost_log.py            # api_cost_logs: tokens, USD cost per agent call
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.py                    # POST /api/auth/signup, /api/auth/login
│   │   │   ├── contracts.py               # GET /api/contracts, /:id, /:id/analyze, /:id/history
│   │   │   ├── dashboard.py               # GET /api/dashboard (top 50 by abs EV)
│   │   │   ├── watchlist.py               # GET/POST/DELETE /api/watchlist
│   │   │   └── usage.py                   # GET /api/usage (plan limits)
│   │   │
│   │   ├── agents/
│   │   │   ├── runners.py                 # run_agent() with prompt caching + cost logging
│   │   │   ├── pipeline.py                # analyze_contract(): parallel gather + synthesis
│   │   │   └── prompts/
│   │   │       ├── data_ingestion.txt
│   │   │       ├── quant_modeling.txt
│   │   │       ├── qualitative_research.txt
│   │   │       ├── sentiment.txt
│   │   │       └── synthesis.txt
│   │   │
│   │   ├── services/
│   │   │   ├── kalshi.py                  # Kalshi REST client (Authorization: Token)
│   │   │   ├── polymarket.py              # Polymarket CLOB REST client
│   │   │   └── cost_tracker.py            # Decimal-precise USD cost computation
│   │   │
│   │   ├── tasks/
│   │   │   ├── contract_sync.py           # ON CONFLICT DO UPDATE upsert from both platforms
│   │   │   └── scheduler.py               # APScheduler: sync every 15 min, prices every 1 hr
│   │   │
│   │   └── middleware/
│   │       └── auth.py                    # JWT decode, UUID validation, get_current_user dep
│   │
│   ├── alembic/                           # async Alembic migrations
│   ├── tests/                             # pytest-asyncio test suite (13 tests)
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   └── src/
│       ├── App.jsx                        # BrowserRouter, AuthLayout guard, 6 routes
│       ├── api/
│       │   ├── client.js                  # axios base client, JWT interceptor
│       │   ├── auth.js                    # signup(), login()
│       │   ├── contracts.js               # getContracts(), getContract(), triggerAnalysis()
│       │   └── watchlist.js               # getWatchlist(), addToWatchlist(), removeFromWatchlist()
│       ├── components/
│       │   ├── Navbar.jsx                 # nav links + logout
│       │   ├── Disclaimer.jsx             # legal footer
│       │   ├── ContractCard.jsx           # platform, title, market price, fair value, EV badge
│       │   ├── EVBadge.jsx                # colored +/-Xc EV indicator
│       │   └── ThesisRenderer.jsx         # ReactMarkdown with prose-invert styling
│       └── pages/
│           ├── Landing.jsx                # login/signup toggle form
│           ├── Dashboard.jsx              # top mispricings, category filter
│           ├── ContractDetail.jsx         # full thesis, metrics, re-analysis trigger
│           ├── Watchlist.jsx              # user watchlist with remove
│           ├── Settings.jsx               # billing placeholder
│           └── History.jsx                # outcome tracking placeholder
│
├── docker-compose.yml                     # postgres:16-alpine, redis:7-alpine
└── .env.example                           # all required environment keys
```

---

## Database Schema

```
users
  id (UUID PK), email (unique), plan (free/pro/premium)
  hashed_password, stripe_customer_id, created_at

contracts
  id (UUID PK), platform (kalshi/polymarket), platform_contract_id
  title, category, current_yes_price, current_no_price, volume
  open_interest, expiry_date, last_fetched_at
  UNIQUE(platform, platform_contract_id)

analyses
  id (UUID PK), contract_id (FK), created_at
  fair_value_yes, fair_value_no, expected_value_yes, confidence
  thesis_markdown (TEXT), agent_costs_usd (Decimal)
  quant_output, qualitative_output, sentiment_output (JSONB)

watchlists
  id (UUID PK), user_id (FK), contract_id (FK), alert_threshold
  UNIQUE(user_id, contract_id)

price_history
  id (BigSerial PK), contract_id (FK)
  yes_price, no_price, volume, recorded_at

api_cost_logs
  id (UUID PK), analysis_id (nullable FK), model, agent_type
  input_tokens, output_tokens, cost_usd, created_at
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Create account, returns JWT |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/contracts` | No | List contracts with latest analysis (100 max) |
| GET | `/api/contracts/:id` | No | Single contract with full thesis |
| POST | `/api/contracts/:id/analyze` | Yes | Queue background re-analysis |
| GET | `/api/contracts/:id/history` | No | Price history (720 points max) |
| GET | `/api/dashboard` | Yes | Top 50 by abs(expected_value_yes) |
| GET | `/api/watchlist` | Yes | User watchlist |
| POST | `/api/watchlist` | Yes | Add contract to watchlist |
| DELETE | `/api/watchlist/:id` | Yes | Remove from watchlist (404 if not owned) |
| GET | `/api/usage` | Yes | Plan limits and current usage counts |
| GET | `/health` | No | `{"status": "ok"}` |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11, FastAPI 0.111, SQLAlchemy 2.0 async, Alembic |
| Database | PostgreSQL 16 (structured) + Redis 7 (rate limiting/caching) |
| Agent Runtime | Anthropic Python SDK, asyncio |
| Models | Haiku 4.5 (ingestion), Sonnet 4.6 (research), Opus 4.7 (synthesis) |
| Frontend | React 18, Vite, Tailwind CSS v3, react-router-dom, axios |
| Auth | JWT (HS256) via python-jose, bcrypt via passlib |
| Background Jobs | APScheduler (AsyncIOScheduler) |
| Market Clients | httpx.AsyncClient (Kalshi REST, Polymarket CLOB) |

---

## Local Development

### Prerequisites

- Docker Desktop
- Python 3.11+
- Node 18+
- An [Anthropic API key](https://console.anthropic.com)
- Kalshi API key (from your Kalshi account settings)

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` and Redis on `localhost:6379`.

### 2. Configure backend

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and fill in all required values
```

Required keys:

```
ANTHROPIC_API_KEY=sk-ant-...
KALSHI_API_KEY=...
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/oracledesk
REDIS_URL=redis://:changeme@localhost:6379/0
CLERK_SECRET_KEY=sk_test_...          # or any non-empty string for local dev
CLERK_PUBLISHABLE_KEY=pk_test_...
SECRET_KEY=your-32-char-random-string
```

### 3. Run migrations and start backend

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Backend available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`.

### 5. Run tests

```bash
cd backend
pytest tests/ -v
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for all Claude calls |
| `KALSHI_API_KEY` | Yes | Kalshi trading API key |
| `POLYMARKET_BASE_URL` | No | Defaults to `https://clob.polymarket.com` |
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql+asyncpg://...`) |
| `REDIS_URL` | No | Defaults to `redis://localhost:6379/0` |
| `SECRET_KEY` | Yes | JWT signing secret (min 32 chars, random) |
| `CLERK_SECRET_KEY` | Yes | Clerk backend key (used for plan gating) |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend key |
| `STRIPE_SECRET_KEY` | No | Stripe key (for billing, Phase 2) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook secret (Phase 2) |

---

## Roadmap

- **Phase 1 (current):** Prediction Market Research Desk (Kalshi + Polymarket)
- **Phase 2:** Sports Betting Thesis Engine
- **Phase 3:** Equity Research Agent
- **Phase 4:** Cross-Market Correlation Engine

---

## License

MIT
