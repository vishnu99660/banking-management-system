import { useState, useEffect } from "react";
import { bankAPI } from "../services/api";
import { formatDate } from "../utils/formatters";
import "../styles/transactions.css";

export function Transactions() {
  const token = localStorage.getItem("access_token");

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const fetchTransactions = async () => {
      try {
        const accountsResponse = await bankAPI.getAccounts();
        const accountsData = accountsResponse.data;

        // =========================
        // GET TRANSACTIONS
        // =========================

        const allTransactions = [];

        for (const account of accountsData) {
          const transactionResponse = await bankAPI.getTransactions(account.id);
          const transactionData = transactionResponse.data;

          const accountTransactions =
            transactionData.map((transaction) => ({
              ...transaction,
              account_number:
                account.account_number,
            }));

          allTransactions.push(
            ...accountTransactions
          );
        }

        // =========================
        // SORT NEWEST FIRST
        // =========================

        allTransactions.sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );

        if (!cancelled) {
          setTransactions(allTransactions);
        }
      } catch (err) {
        console.error(
          "Failed to load transactions:",
          err
        );

        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to load transactions"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTransactions();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // =========================
  // TRANSACTION TYPE
  // =========================

  const getTransactionType = (type) => {
    switch (type) {
      case "deposit":
        return "Deposit";

      case "withdrawal":
        return "Withdrawal";

      case "transfer_sent":
        return "Transfer Sent";

      case "transfer_received":
        return "Transfer Received";

      default:
        return type;
    }
  };

  // =========================
  // DESCRIPTION
  // =========================

  const getDescription = (type) => {
    switch (type) {
      case "deposit":
        return "Money deposited into account";

      case "withdrawal":
        return "Money withdrawn from account";

      case "transfer_sent":
        return "Money transferred to another account";

      case "transfer_received":
        return "Money received from another account";

      default:
        return "Bank transaction";
    }
  };

  // =========================
  // AMOUNT
  // =========================

  const getAmount = (transaction) => {
    const amount = Number(transaction.amount);

    if (
      transaction.transaction_type ===
        "withdrawal" ||
      transaction.transaction_type ===
        "transfer_sent"
    ) {
      return `-₹${amount.toFixed(2)}`;
    }

    return `+₹${amount.toFixed(2)}`;
  };

  // =========================
  // NOT LOGGED IN
  // =========================

  if (!token) {
    return (
      <div className="loading-container">
        Please login first.
      </div>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="loading-container">
        Loading transactions...
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h1>Transaction History</h1>

        <p>
          View all your recent transactions
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="transactions-table-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="no-data"
                >
                  No transactions yet
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className={`transaction-row ${tx.transaction_type}`}
                >
                  <td>
                    {formatDate(tx.created_at)}
                  </td>

                  <td>
                    <span className="tx-type">
                      {getTransactionType(
                        tx.transaction_type
                      )}
                    </span>
                  </td>

                  <td>
                    {getDescription(
                      tx.transaction_type
                    )}
                  </td>

                  <td>
                    {tx.account_number}
                  </td>

                  <td className="amount">
                    {getAmount(tx)}
                  </td>

                  <td>
                    <span className="status">
                      Completed
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;
