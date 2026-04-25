from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    anthropic_api_key: str
    kalshi_api_key: str
    kalshi_base_url: str = "https://trading-api.kalshi.com/trade-api/v2"
    polymarket_base_url: str = "https://clob.polymarket.com"
    fred_api_key: str = ""
    database_url: str
    redis_url: str = "redis://localhost:6379/0"
    clerk_secret_key: str
    clerk_publishable_key: str
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
