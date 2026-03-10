from fastapi import FastAPI
from .database import Base, engine
from .routers import user
from fastapi.middleware.cors import CORSMiddleware
from .routers import analytics
from .routers import feedback
from app.routers import ai

# Base.metadata.create_all(bind=engine)

app = FastAPI()


origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
        "https://your-vercel-app.vercel.app", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user.router)
app.include_router(analytics.router)
app.include_router(feedback.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"message": "API Running"}