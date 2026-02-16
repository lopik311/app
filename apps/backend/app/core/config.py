from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "mini-crm"
    environment: str = "dev"
    db_url: str = "postgresql+psycopg://postgres:postgres@db:5432/minicrm"
    bot_token: str = ""
    telegram_webhook_secret: str = ""
    webapp_url: str = "http://localhost:3000/webapp"
    jwt_secret: str = "change-me"
    jwt_exp_minutes: int = 120
    consent_version: str = "v1"
    telegram_initdata_ttl_seconds: int = 3600

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
