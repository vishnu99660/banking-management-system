from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine, Base
from app.models.user import User

# Import your routes
from app.routes.auth import router as auth_router
from app.routes.bank import router as bank_router


app = FastAPI(
    title="Banking Management System API"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://localhost:5174",
        "http://127.0.0.1:5174",

        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE
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