import axios from 'axios';

const API_URL =
  'https://banking-management-system-production-472c.up.railway.app';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user_data');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authAPI = {
  register: (data) =>
    apiClient.post('/auth/register', data),

  login: (email, password) =>
    apiClient.post('/auth/login', null, {
      params: {
        email: email.trim(),
        password: password,
      },
    }),
};

export const bankAPI = {
  getAccounts: () => {
    const user = getStoredUser();

    if (!user?.id) {
      return Promise.reject(
        new Error('User session not found')
      );
    }

    return apiClient.get(`/bank/accounts/user/${user.id}`);
  },

  createAccount: (accountData) => {
    const user = getStoredUser();

    if (!user?.id) {
      return Promise.reject(
        new Error('User session not found')
      );
    }

    return apiClient.post('/bank/accounts', accountData, {
      params: {
        user_id: user.id,
      },
    });
  },

  getTransactions: (accountId) =>
    apiClient.get(`/bank/transactions/${accountId}`),

  deposit: (accountId, amount) =>
    apiClient.post('/bank/deposit', null, {
      params: {
        account_id: accountId,
        amount,
      },
    }),

  withdraw: (accountId, amount) =>
    apiClient.post('/bank/withdraw', null, {
      params: {
        account_id: accountId,
        amount,
      },
    }),

  transfer: (transferData) =>
    apiClient.post('/bank/transfer', transferData),
};

export default apiClient;