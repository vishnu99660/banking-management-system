from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine, Base
from app.models.user import User

from app.routes.auth import router as auth_router
from app.routes.bank import router as bank_router


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Banking Management System API",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # Local frontend
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",

        # Deployed frontend
        "https://luminous-energy-production-286a.up.railway.app",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# DATABASE TABLE CREATION
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# ROUTES
# =========================================================

app.include_router(auth_router)
app.include_router(bank_router)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to Banking Management System API 🚀"
    }


# =========================================================
# DATABASE TEST
# =========================================================

@app.get("/db-test")
def database_test():

    try:
        with engine.connect():
            return {
                "status": "success",
                "message": "MySQL database connected successfully"
            }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }