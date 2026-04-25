from app.config import settings

def test_settings_loads():
    assert settings.database_url.startswith("postgresql")
    assert settings.anthropic_api_key != ""
