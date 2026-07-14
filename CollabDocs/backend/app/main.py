from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine, SessionLocal
from .seed import seed_users
from .routers import auth_routes, documents

models.Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()
    yield


app = FastAPI(title="CollabDocs API", version="0.1.0", lifespan=lifespan)

# Wide-open CORS for assessment/demo purposes; would be locked to specific
# origins in a real production deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(documents.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "collabdocs-api"}
