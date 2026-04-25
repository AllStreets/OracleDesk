# backend/app/tasks/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.tasks.contract_sync import sync_contracts, record_prices

scheduler = AsyncIOScheduler()

def start_scheduler():
    scheduler.add_job(sync_contracts, "interval", minutes=15, id="contract_sync")
    scheduler.add_job(record_prices, "interval", hours=1, id="price_recorder")
    scheduler.start()

def stop_scheduler():
    scheduler.shutdown()
