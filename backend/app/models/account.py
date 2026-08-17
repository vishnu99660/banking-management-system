from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from datetime import datetime
import random
from app.database.connection import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

   
    account_number = Column(
    String(20),
    unique=True,
    nullable=False,
    index=True,
    default=lambda: str(random.randint(1000000000, 9999999999))
)

    account_type = Column(
        String(20),
        default="Savings",
        nullable=False
    )

    balance = Column(
        Numeric(12, 2),
        default=0.00,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )