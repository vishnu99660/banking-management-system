import os

from urllib.parse import quote_plus

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from dotenv import load_dotenv

load_dotenv()


# =========================================================
# DATABASE CONNECTION
# =========================================================

# Railway provides MYSQL_URL.
# Local development can continue using DB_* variables.
DATABASE_URL = os.getenv("DATABASE_URL")


# =========================================================
# RAILWAY
# =========================================================

if DATABASE_URL:
    # Railway MYSQL_URL may start with mysql://
    # SQLAlchemy + PyMySQL needs mysql+pymysql://

    if DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = DATABASE_URL.replace(
            "mysql://",
            "mysql+pymysql://",
            1
        )


# =========================================================
# LOCAL DEVELOPMENT FALLBACK
# =========================================================

else:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "banking_db")

    DATABASE_URL = (
        f"mysql+pymysql://"
        f"{DB_USER}:"
        f"{quote_plus(DB_PASSWORD)}@"
        f"{DB_HOST}:"
        f"{DB_PORT}/"
        f"{DB_NAME}"
    )


# =========================================================
# SAFETY CHECK
# =========================================================

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured"
    )


# =========================================================
# SQLALCHEMY
# =========================================================

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()