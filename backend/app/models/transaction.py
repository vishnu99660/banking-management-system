from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey
from datetime import datetime

from app.database.connection import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
        nullable=False
    )

    transaction_type = Column(
        String(20),
        nullable=False
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )