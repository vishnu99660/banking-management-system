from typing import Optional

from pydantic import BaseModel
from decimal import Decimal


class TransactionCreate(BaseModel):
    account_id: int
    transaction_type: str
    amount: Decimal


class TransactionResponse(BaseModel):
    id: int
    account_id: int
    transaction_type: str
    amount: Decimal

    class Config:
        from_attributes = True
        
class TransferCreate(BaseModel):
    from_account_id: int
    to_account_id: Optional[int] = None
    to_account_number: Optional[str] = None
    amount: Decimal
