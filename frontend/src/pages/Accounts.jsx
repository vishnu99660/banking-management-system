import { useState, useEffect } from 'react';
import { bankAPI } from '../services/api';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { formatCurrency, formatDate } from '../utils/formatters';
import '../styles/accounts.css';

export function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [transferData, setTransferData] = useState({ from_account_id: '', to_account_number: '', amount: '' });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await bankAPI.getAccounts();
      setAccounts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      await bankAPI.deposit(selectedAccount.id, amount);
      setShowDepositModal(false);
      setAmount('');
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Deposit failed');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await bankAPI.withdraw(selectedAccount.id, amount);
      setShowWithdrawModal(false);
      setAmount('');
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Withdrawal failed');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await bankAPI.transfer(transferData);
      setShowTransferModal(false);
      setTransferData({ from_account_id: '', to_account_number: '', amount: '' });
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Transfer failed');
    }
  };

  if (loading) return <div className="loading-container">Loading accounts...</div>;

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <h1>Account Management</h1>
        <p>Manage all your accounts and transactions</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="accounts-list">
        {accounts.length === 0 ? (
          <div className="no-data">No accounts found</div>
        ) : (
          accounts.map(account => (
            <Card key={account.id} className="account-detail-card">
              <CardHeader>
                <div>
                  <h3>{account.account_type}</h3>
                  <p className="account-info">Account #{account.account_number}</p>
                </div>
                <div className="account-balance-large">{formatCurrency(account.balance)}</div>
              </CardHeader>
              <CardBody>
                <div className="account-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Account Type:</span>
                    <span className="detail-value">{account.account_type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Balance:</span>
                    <span className="detail-value">{formatCurrency(account.balance)}</span>
                  </div>
                </div>
              </CardBody>
              <div className="account-actions-group">
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => {
                    setSelectedAccount(account);
                    setShowDepositModal(true);
                  }}
                >
                  💰 Deposit
                </Button>
                <Button 
                  variant="warning" 
                  size="sm"
                  onClick={() => {
                    setSelectedAccount(account);
                    setShowWithdrawModal(true);
                  }}
                >
                  💸 Withdraw
                </Button>
                <Button 
                  variant="info" 
                  size="sm"
                  onClick={() => {
                    setSelectedAccount(account);
                    setTransferData({ from_account_id: String(account.id), to_account_number: '', amount: '' });
                    setShowTransferModal(true);
                  }}
                >
                  🔄 Transfer
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Deposit Modal */}
      <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="Deposit Money">
        {selectedAccount && (
          <form onSubmit={handleDeposit} className="modal-form">
            <p className="modal-account-info">Account: {selectedAccount.account_type} • {formatCurrency(selectedAccount.balance)}</p>
            <Input
              type="number"
              placeholder="Deposit Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              required
            />
            <div className="modal-buttons">
              <Button type="submit" variant="success">Deposit</Button>
              <Button type="button" variant="secondary" onClick={() => setShowDepositModal(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="Withdraw Money">
        {selectedAccount && (
          <form onSubmit={handleWithdraw} className="modal-form">
            <p className="modal-account-info">Account: {selectedAccount.account_type} • {formatCurrency(selectedAccount.balance)}</p>
            <Input
              type="number"
              placeholder="Withdrawal Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              required
            />
            <div className="modal-buttons">
              <Button type="submit" variant="warning">Withdraw</Button>
              <Button type="button" variant="secondary" onClick={() => setShowWithdrawModal(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Transfer Modal */}
      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Money">
        <form onSubmit={handleTransfer} className="modal-form">
          <div className="form-group">
            <label>From Account</label>
            <select
              value={transferData.from_account_id}
              onChange={(e) => setTransferData({ ...transferData, from_account_id: e.target.value })}
              className="form-select"
              required
            >
              <option value="">Select account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type} - {formatCurrency(acc.balance)}
                </option>
              ))}
            </select>
          </div>
          <p className="modal-account-info">
            Enter the recipient&apos;s account number. It may belong to another user.
          </p>
          <Input
            type="text"
            placeholder="Recipient account number"
            value={transferData.to_account_number}
            onChange={(e) => setTransferData({ ...transferData, to_account_number: e.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Transfer Amount"
            value={transferData.amount}
            onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
            step="0.01"
            required
          />
          <div className="modal-buttons">
            <Button type="submit" variant="info">Transfer</Button>
            <Button type="button" variant="secondary" onClick={() => setShowTransferModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
