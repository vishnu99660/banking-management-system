import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { bankAPI } from '../services/api';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { formatCurrency, formatDate } from '../utils/formatters';
import '../styles/dashboard.css';

export function Dashboard() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [error, setError] = useState('');
  const [newAccount, setNewAccount] = useState({ account_type: 'Savings', balance: '0' });

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await bankAPI.createAccount(newAccount);
      setShowCreateModal(false);
      setNewAccount({ account_type: 'Savings', balance: '0' });
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account');
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.full_name}! 👋</h1>
          <p>Here's your financial overview</p>
        </div>
        <Button variant="success" onClick={() => setShowCreateModal(true)}>
          + New Account
        </Button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="dashboard-grid">
        <Card className="balance-card">
          <CardBody>
            <h3>Total Balance</h3>
            <div className="balance-amount">{formatCurrency(totalBalance)}</div>
            <p className="balance-accounts">{accounts.length} accounts</p>
          </CardBody>
        </Card>
      </div>

      <div className="accounts-section">
        <h2>Your Accounts</h2>
        {loading ? (
          <div className="loading">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="no-accounts">
            <p>No accounts yet</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create Your First Account
            </Button>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map(account => (
              <Card key={account.id} className="account-card">
                <CardHeader>
                  <h3>{account.account_type}</h3>
                  <span className="account-number">•••• {account.account_number?.slice(-4)}</span>
                </CardHeader>
                <CardBody>
                  <div className="account-balance">{formatCurrency(account.balance)}</div>
                  <p className="account-type">Account Type: {account.account_type}</p>
                </CardBody>
                <div className="account-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedAccount(account)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Account">
        <form onSubmit={handleCreateAccount} className="modal-form">
          <div className="form-group">
            <label>Account Type</label>
            <select
              value={newAccount.account_type}
              onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value })}
              className="form-select"
            >
              <option value="Savings">Savings Account</option>
              <option value="Checking">Checking Account</option>
              <option value="Money Market">Money Market</option>
              <option value="Investment">Investment</option>
            </select>
          </div>
          <Input
            type="number"
            placeholder="Initial Balance"
            name="balance"
            value={newAccount.balance}
            onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
            step="0.01"
          />
          <div className="modal-buttons">
            <Button type="submit" variant="success">Create Account</Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedAccount)}
        onClose={() => setSelectedAccount(null)}
        title="Account Details"
      >
        {selectedAccount && (
          <div className="account-details-modal">
            <div className="account-detail-row">
              <span>Account ID</span>
              <strong>{selectedAccount.id}</strong>
            </div>
            <div className="account-detail-row">
              <span>Account number</span>
              <strong>{selectedAccount.account_number}</strong>
            </div>
            <div className="account-detail-row">
              <span>Account type</span>
              <strong>{selectedAccount.account_type}</strong>
            </div>
            <div className="account-detail-row">
              <span>Current balance</span>
              <strong>{formatCurrency(selectedAccount.balance)}</strong>
            </div>
            <div className="account-detail-row">
              <span>Opened on</span>
              <strong>{selectedAccount.created_at ? formatDate(selectedAccount.created_at) : 'Not available'}</strong>
            </div>
            <Button variant="secondary" onClick={() => setSelectedAccount(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
