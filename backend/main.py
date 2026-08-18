from fastapi import FastAPI

from app.database.connection import engine, Base

from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction

from app.routes.auth import router as auth_router
from app.routes.bank import router as bank_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Banking Management System API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(bank_router)


Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Welcome to Banking Management System API 🚀"
    }


@app.get("/db-test")
def database_test():
    try:
        with engine.connect() as connection:
            return {
                "status": "success",
                "message": "MySQL database connected successfully"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }