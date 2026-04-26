"""Seed demo contracts and analyses for UI preview."""
import asyncio
from decimal import Decimal
from datetime import datetime, timedelta
from app.database import AsyncSessionLocal
from app.models.contract import Contract
from app.models.analysis import Analysis
from app.models.price_history import PriceHistory
from sqlalchemy import select

CONTRACTS = [
    {
        "platform": "kalshi",
        "platform_contract_id": "FED-2024-MAY-CUT",
        "title": "Will the Fed cut rates at the May 2026 FOMC meeting?",
        "category": "Economics",
        "current_yes_price": Decimal("0.31"),
        "current_no_price": Decimal("0.69"),
        "volume": 2_840_000,
        "open_interest": 1_200_000,
        "expiry_date": datetime(2026, 5, 7),
        "fair_value_yes": Decimal("0.19"),
        "expected_value_yes": Decimal("-0.118"),
        "confidence": "high",
        "thesis": """## Fed May Cut — NO at 31c is a strong fade

**Thesis:** The market is pricing 31% probability of a May cut. The quant model arrives at 19%. This is a 12-point mismatch on a contract with tight bid/ask spread and high liquidity.

**Why the market is wrong:** CME FedWatch is anchored to outdated rate path expectations. Core PCE printed 2.8% in March, above the Fed's comfort band. Powell's March presser language explicitly removed "rate cut" from forward guidance. The probability implied by fed funds futures markets — which historically leads Kalshi by 2-3 days — is 17%.

**Quantitative edge:** Fair value 19c vs. market 31c = -12c expected value on the YES side. Buying NO at 69c implies a 17c edge vs. fair value (fair NO = 81c).

**Conditions under which this thesis is wrong:** A sudden deterioration in labor markets (NFP miss >100k below consensus), a banking sector stress event, or a surprise CPI print below 2.5% would shift the calculus materially.

**Position:** Long NO at 69c. Size proportional to conviction: high.""",
    },
    {
        "platform": "polymarket",
        "platform_contract_id": "SCOTUS-CHEVRON-2026",
        "title": "Will the Supreme Court rule in favor of petitioner in Loper Bright v. Raimondo?",
        "category": "Politics",
        "current_yes_price": Decimal("0.78"),
        "current_no_price": Decimal("0.22"),
        "volume": 1_120_000,
        "open_interest": 540_000,
        "expiry_date": datetime(2026, 6, 30),
        "fair_value_yes": Decimal("0.84"),
        "expected_value_yes": Decimal("0.062"),
        "confidence": "medium",
        "thesis": """## Loper Bright — YES at 78c offers modest edge

**Thesis:** Oral argument sentiment analysis and the ideological composition of the current court imply an ~84% probability of a ruling for petitioner. Market is at 78c — a 6-point discount.

**Why the market is underpricing:** The 6-3 conservative supermajority has signaled hostility to Chevron deference in multiple recent opinions (West Virginia v. EPA, Biden v. Nebraska). Justice Gorsuch's concurrence in West Virginia explicitly invited a Chevron challenge. All three oral argument prediction models score this 80-85% petitioner win.

**Key risk:** The court rules narrowly — affirming on other grounds without reaching Chevron — which would likely resolve at NO or be voided. That scenario is priced at roughly 12% by the sentiment model.

**Conditions under which this thesis is wrong:** A surprise retirement or recusal, or the court punting to next term.

**Position:** Long YES at 78c. Modest size given medium confidence.""",
    },
    {
        "platform": "kalshi",
        "platform_contract_id": "BTCEND-100K-JUN26",
        "title": "Will Bitcoin close above $100,000 on June 30, 2026?",
        "category": "Crypto",
        "current_yes_price": Decimal("0.52"),
        "current_no_price": Decimal("0.48"),
        "volume": 4_200_000,
        "open_interest": 2_100_000,
        "expiry_date": datetime(2026, 6, 30),
        "fair_value_yes": Decimal("0.51"),
        "expected_value_yes": Decimal("-0.008"),
        "confidence": "low",
        "thesis": """## BTC $100K by June 30 — No Edge, Avoid

**Thesis:** The market is essentially efficient here. Quant model fair value is 51c vs. market 52c. Within the margin of error.

**Why this is a pass:** Bitcoin price at expiry is driven primarily by macro risk appetite (correlated with equity vol) and ETF flow momentum. The current Pearson correlation between BTC 30-day return and SPX 30-day return is 0.71 — the highest since 2022. With the Fed on hold and no clear macro catalyst in the next 9 weeks, both tails are fat and roughly symmetric.

**What would create edge:** A clear ETF inflow acceleration (>$500M/day for 5+ consecutive days) or a decisive macro directional move would shift the model meaningfully. Monitor and revisit.

**Position:** No position. Insufficient edge to justify transaction costs.""",
    },
    {
        "platform": "polymarket",
        "platform_contract_id": "AI-ACT-US-2026",
        "title": "Will the US pass federal AI regulation legislation in 2026?",
        "category": "Technology",
        "current_yes_price": Decimal("0.14"),
        "current_no_price": Decimal("0.86"),
        "volume": 680_000,
        "open_interest": 290_000,
        "expiry_date": datetime(2026, 12, 31),
        "fair_value_yes": Decimal("0.09"),
        "expected_value_yes": Decimal("-0.047"),
        "confidence": "high",
        "thesis": """## US Federal AI Regulation in 2026 — NO has further to run

**Thesis:** The market prices 14% probability of federal AI legislation passing in 2026. The qualitative model arrives at 9%. NO at 86c is still attractive.

**Why the market is too generous to YES:** Legislative base rates for complex tech regulation in a divided Congress are historically 4-8% per calendar year. The current Congress has 22 competing AI bills in committee with zero showing committee markup activity. The administration's executive order approach signals preference for regulatory agency action over legislation. The Senate Commerce Committee chair has publicly deprioritized floor time for AI bills in 2026.

**Historical analogs:** GDPR-equivalent US privacy legislation has been discussed since 2018 — still no federal law. Section 230 reform has failed 6 consecutive sessions. Complex tech legislation requires 2-3 years of committee process before a floor vote; the clock has not started.

**Conditions under which this thesis is wrong:** A high-profile AI-related public safety incident (model-caused fatality, infrastructure attack) that creates political urgency; or a rider attached to a must-pass bill (NDAA, appropriations).

**Position:** Long NO at 86c. High conviction, size accordingly.""",
    },
    {
        "platform": "kalshi",
        "platform_contract_id": "RECESSION-2026-H1",
        "title": "Will the US economy enter recession in H1 2026?",
        "category": "Economics",
        "current_yes_price": Decimal("0.22"),
        "current_no_price": Decimal("0.78"),
        "volume": 3_100_000,
        "open_interest": 1_800_000,
        "expiry_date": datetime(2026, 6, 30),
        "fair_value_yes": Decimal("0.27"),
        "expected_value_yes": Decimal("0.051"),
        "confidence": "medium",
        "thesis": """## H1 2026 Recession — YES at 22c is underpriced

**Thesis:** Consensus is anchored to soft landing. The quant model sees 27% recession probability vs. 22c market — a 5-point edge on YES.

**Leading indicators in disagreement with consensus:** The Conference Board Leading Economic Index has declined for 8 of the last 10 months. The yield curve (2s10s) inverted 14 months ago — the average lag to recession onset is 12-18 months, placing the window squarely in H1 2026. ISM Manufacturing has been sub-50 for 6 consecutive months. Consumer credit delinquency rates (90+ days) have risen 40bps YTD, now above pre-COVID levels.

**What the market is getting wrong:** Consensus is applying the 2023-2024 soft-landing prior too aggressively. The labor market, which drove the soft landing narrative, is showing cracks: JOLTS job openings are down 28% from peak, temp employment (leading indicator for payrolls) has declined 3 consecutive months.

**Key risk:** NBER recession dating lags real-time — a recession could begin in Q1 but not be officially declared until Q3, resolving this contract NO on a technicality depending on resolution rules.

**Position:** Long YES at 22c. Medium conviction. Verify resolution criteria before sizing.""",
    },
    {
        "platform": "polymarket",
        "platform_contract_id": "TRUMP-APPROVAL-50-2026",
        "title": "Will Trump's approval rating exceed 50% in 2026?",
        "category": "Politics",
        "current_yes_price": Decimal("0.09"),
        "current_no_price": Decimal("0.91"),
        "volume": 920_000,
        "open_interest": 410_000,
        "expiry_date": datetime(2026, 12, 31),
        "fair_value_yes": Decimal("0.07"),
        "expected_value_yes": Decimal("-0.021"),
        "confidence": "medium",
        "thesis": """## Trump Approval >50% — NO is right but already well-priced

**Thesis:** Market at 9c YES, model at 7c. The 2-point gap is real but thin — insufficient edge after transaction costs.

**Why NO is structurally correct:** No president in the polling era has moved more than 8 points net approval in a single year from a polarized base. Trump's approval has been range-bound 42-46% for 24 consecutive months across 6 different polling aggregators. The structural partisan polarization in US politics makes a 50%+ reading mathematically difficult without a major catalyzing event (war, economic boom).

**Why this is a pass and not a conviction NO:** The market already prices 91% NO — the edge is insufficient to overcome bid/ask spread and opportunity cost. There is no mis-pricing worth acting on.

**Position:** No position. Market is approximately efficient at these prices.""",
    },
]

async def seed():
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        result = await db.execute(select(Contract).limit(1))
        if result.scalar_one_or_none():
            print("Already seeded — clearing and re-seeding...")
            await db.execute(__import__("sqlalchemy").text("DELETE FROM analyses"))
            await db.execute(__import__("sqlalchemy").text("DELETE FROM price_history"))
            await db.execute(__import__("sqlalchemy").text("DELETE FROM watchlists"))
            await db.execute(__import__("sqlalchemy").text("DELETE FROM contracts"))
            await db.commit()

        for i, c in enumerate(CONTRACTS):
            contract = Contract(
                platform=c["platform"],
                platform_contract_id=c["platform_contract_id"],
                title=c["title"],
                category=c["category"],
                current_yes_price=c["current_yes_price"],
                current_no_price=c["current_no_price"],
                volume=c["volume"],
                expiry_date=c["expiry_date"],
                last_fetched_at=datetime.utcnow(),
            )
            db.add(contract)
            await db.flush()

            analysis = Analysis(
                contract_id=contract.id,
                fair_value_yes=c["fair_value_yes"],
                fair_value_no=1 - c["fair_value_yes"],
                expected_value_yes=c["expected_value_yes"],
                confidence=c["confidence"],
                thesis_markdown=c["thesis"],
                agent_costs_usd=Decimal("0.31"),
            )
            db.add(analysis)

            # Add 48 price history points (last 48 hours)
            import random
            base = float(c["current_yes_price"])
            for h in range(48):
                drift = random.gauss(0, 0.008)
                price = min(0.99, max(0.01, base + drift * (48 - h) / 48))
                db.add(PriceHistory(
                    contract_id=contract.id,
                    yes_price=Decimal(str(round(price, 3))),
                    no_price=Decimal(str(round(1 - price, 3))),
                    recorded_at=datetime.utcnow() - timedelta(hours=48 - h),
                ))

        await db.commit()
        print(f"Seeded {len(CONTRACTS)} contracts with analyses and price history.")

if __name__ == "__main__":
    asyncio.run(seed())
