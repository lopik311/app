import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api import admin_auth, admin_clients, admin_refs, admin_requests, telegram, webapp
from app.db.base import Base
from app.db.session import engine

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="mini-crm api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webapp.router)
app.include_router(telegram.router)
app.include_router(admin_auth.router)
app.include_router(admin_requests.router)
app.include_router(admin_clients.router)
app.include_router(admin_refs.router)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health() -> dict:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok"}
