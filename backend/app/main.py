import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, companies, admin, admin_stats, integrations, notifications, watchlist, chat, dashboard, financial_analysis, risk_analysis

app = FastAPI(title="Cégverzum API", version="0.2.0")

_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(admin.router)
app.include_router(integrations.router)
app.include_router(notifications.router)
app.include_router(watchlist.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(admin_stats.router)
app.include_router(financial_analysis.router)
app.include_router(risk_analysis.router)


@app.get("/")
def root():
    return {"message": "Cégverzum API", "version": "0.2.0"}
