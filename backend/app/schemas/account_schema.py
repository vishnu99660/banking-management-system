from pydantic import BaseModel
from decimal import Decimal


class AccountCreate(BaseModel):
    account_type: str
    balance: Decimal = Decimal("0.00")


class AccountResponse(BaseModel):
    id: int
    user_id: int
    account_number: str
    account_type: str
    balance: Decimal

    class Config:
        from_attributes = True