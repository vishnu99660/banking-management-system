from decimal import Decimal

from fastapi import APIRouter, Depends
from starlette.exceptions import HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.account_schema import AccountCreate
from app.schemas.transaction_schema import TransferCreate
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/bank",
    tags=["Bank"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# CREATE ACCOUNT
# =========================

@router.post("/accounts")
def create_account(
    account: AccountCreate,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only create an account for yourself"
        )

    new_account = Account(
        user_id=user_id,
        account_type=account.account_type,
        balance=account.balance
    )

    db.add(new_account)
    db.commit()
    db.refresh(new_account)

    return {
        "message": "Account created successfully",
        "account_id": new_account.id,
        "account_number": new_account.account_number,
        "account_type": new_account.account_type,
        "balance": new_account.balance
    }


# =========================
# DEPOSIT
# =========================

@router.post("/deposit")
def deposit_money(
    account_id: int,
    amount: Decimal,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    account = (
        db.query(Account)
        .filter(Account.id == account_id)
        .first()
    )

    if account is None:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    if account.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to use this account"
        )

    if amount <= Decimal("0"):
        raise HTTPException(
            status_code=400,
            detail="Deposit amount must be greater than 0"
        )

    current_balance = Decimal(str(account.balance))
    new_balance = current_balance + amount

    setattr(account, "balance", new_balance)

    transaction = Transaction(
        account_id=account_id,
        transaction_type="deposit",
        amount=amount
    )

    db.add(transaction)
    db.commit()
    db.refresh(account)

    return {
        "message": "Money deposited successfully",
        "account_id": account_id,
        "new_balance": new_balance
    }


# =========================
# WITHDRAW
# =========================

@router.post("/withdraw")
def withdraw_money(
    account_id: int,
    amount: Decimal,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    account = (
        db.query(Account)
        .filter(Account.id == account_id)
        .first()
    )

    if account is None:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    if account.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to use this account"
        )

    if amount <= Decimal("0"):
        raise HTTPException(
            status_code=400,
            detail="Withdrawal amount must be greater than 0"
        )

    current_balance = Decimal(str(account.balance))

    if amount > current_balance:
        raise HTTPException(
            status_code=400,
            detail="Insufficient balance"
        )

    new_balance = current_balance - amount

    setattr(account, "balance", new_balance)

    transaction = Transaction(
        account_id=account_id,
        transaction_type="withdrawal",
        amount=amount
    )

    db.add(transaction)
    db.commit()
    db.refresh(account)

    return {
        "message": "Money withdrawn successfully",
        "account_id": account_id,
        "new_balance": new_balance
    }


# =========================
# TRANSFER
# =========================

@router.post("/transfer")
def transfer_money(
    transfer: TransferCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    sender = (
        db.query(Account)
        .filter(Account.id == transfer.from_account_id)
        .first()
    )

    if transfer.to_account_id is not None and transfer.to_account_number:
        raise HTTPException(
            status_code=400,
            detail="Provide either a recipient account ID or account number, not both"
        )

    if transfer.to_account_number:
        receiver = (
            db.query(Account)
            .filter(Account.account_number == transfer.to_account_number.strip())
            .first()
        )
    elif transfer.to_account_id is not None:
        receiver = (
            db.query(Account)
            .filter(Account.id == transfer.to_account_id)
            .first()
        )
    else:
        raise HTTPException(
            status_code=400,
            detail="Recipient account number is required"
        )

    if sender is None:
        raise HTTPException(
            status_code=404,
            detail="Sender account not found"
        )

    if receiver is None:
        raise HTTPException(
            status_code=404,
            detail="Receiver account not found"
        )

    if sender.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to use the sender account"
        )

    if sender.id == receiver.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot transfer money to the same account"
        )

    if transfer.amount <= Decimal("0"):
        raise HTTPException(
            status_code=400,
            detail="Transfer amount must be greater than 0"
        )

    sender_balance = Decimal(str(sender.balance))

    if transfer.amount > sender_balance:
        raise HTTPException(
            status_code=400,
            detail="Insufficient balance"
        )

    new_sender_balance = sender_balance - transfer.amount

    receiver_balance = Decimal(str(receiver.balance))
    new_receiver_balance = receiver_balance + transfer.amount

    setattr(sender, "balance", new_sender_balance)
    setattr(receiver, "balance", new_receiver_balance)

    sender_transaction = Transaction(
        account_id=sender.id,
        transaction_type="transfer_sent",
        amount=transfer.amount
    )

    receiver_transaction = Transaction(
        account_id=receiver.id,
        transaction_type="transfer_received",
        amount=transfer.amount
    )

    db.add(sender_transaction)
    db.add(receiver_transaction)

    db.commit()

    return {
        "message": "Money transferred successfully",
        "from_account": sender.id,
        "to_account": receiver.id,
        "amount": transfer.amount,
        "sender_new_balance": new_sender_balance,
        "receiver_new_balance": new_receiver_balance
    }


# =========================
# ACCOUNT DETAILS
# =========================

@router.get("/accounts/{account_id}")
def get_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    account = (
        db.query(Account)
        .filter(Account.id == account_id)
        .first()
    )

    if account is None:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    if account.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this account"
        )

    return {
        "id": account.id,
        "user_id": account.user_id,
        "account_number": account.account_number,
        "account_type": account.account_type,
        "balance": account.balance,
        "created_at": account.created_at
    }


# =========================
# USER ACCOUNTS
# =========================

@router.get("/accounts/user/{user_id}")
def get_user_accounts(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access these accounts"
        )

    accounts = (
        db.query(Account)
        .filter(Account.user_id == user_id)
        .all()
    )

    if not accounts:
        raise HTTPException(
            status_code=404,
            detail="No accounts found for this user"
        )

    return [
        {
            "id": account.id,
            "user_id": account.user_id,
            "account_number": account.account_number,
            "account_type": account.account_type,
            "balance": account.balance,
            "created_at": account.created_at
        }
        for account in accounts
    ]
# =========================
# TRANSACTION HISTORY
# =========================

# =========================
# TRANSACTION HISTORY
# =========================

@router.get("/transactions/{account_id}")
def get_transaction_history(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Find account
    account = (
        db.query(Account)
        .filter(Account.id == account_id)
        .first()
    )

    if account is None:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    # Check account ownership
    if account.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to view these transactions"
        )

    # Get transaction history
    transactions = (
        db.query(Transaction)
        .filter(Transaction.account_id == account_id)
        .order_by(Transaction.id.desc())
        .all()
    )

    return [
        {
            "id": transaction.id,
            "account_id": transaction.account_id,
            "transaction_type": transaction.transaction_type,
            "amount": transaction.amount,
            "created_at": transaction.created_at
        }
        for transaction in transactions
    ]
