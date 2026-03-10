from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import user
from .routers import analytics
from .routers import feedback
from app.routers import ai

# Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allowed frontend origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ann-ai-zeta.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(user.router)
app.include_router(analytics.router)
app.include_router(feedback.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"message": "API Running"}