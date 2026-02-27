import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.middleware import RequestLogMiddleware
from app.routers import auth, companies, admin, admin_stats, admin_logs, integrations, notifications, watchlist, chat, dashboard, financial_analysis, risk_analysis


@asynccontextmanager
async def lifespan(app: FastAPI):
    import app.models  # noqa: F401 — ensure all models are loaded
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Cégverzum API", version="0.2.0", lifespan=lifespan)

_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLogMiddleware)

app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(admin.router)
app.include_router(integrations.router)
app.include_router(notifications.router)
app.include_router(watchlist.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(admin_stats.router)
app.include_router(admin_logs.router)
app.include_router(financial_analysis.router)
app.include_router(risk_analysis.router)


@app.get("/")
def root():
    return {"message": "Cégverzum API", "version": "0.2.0"}
