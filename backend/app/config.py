from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/cegverzum"
    app_name: str = "Cégverzum API"
    secret_key: str = "CHANGE-ME-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    # NAV Online Számla API v3.0
    nav_api_url: str = "https://api.onlineszamla.nav.gov.hu/invoiceService/v3"
    nav_login: str = ""
    nav_password: str = ""
    nav_signature_key: str = ""
    nav_tax_number: str = ""
    nav_software_id: str = "HU00000000-00000001"

    model_config = {"env_file": ".env"}


settings = Settings()
