import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardOverview = async () => {
  const response = await api.get('/dashboard/overview');
  return response.data;
};

export const getWatchlist = async () => {
  const response = await api.get('/dashboard/watchlist');
  return response.data;
};

export const predictSingleEmployee = async (employeeData) => {
  const response = await api.post('/predict/single', employeeData);
  return response.data;
};

export const predictWhatIf = async (baseEmployee, overrides) => {
  const response = await api.post('/predict/whatif', {
    base_employee: baseEmployee,
    overrides: overrides,
  });
  return response.data;
};

export const getModelMetrics = async () => {
  const response = await api.get('/model/metrics');
  return response.data;
};

export const getFeatureImportance = async () => {
  const response = await api.get('/model/feature-importance');
  return response.data;
};

export const generateRetentionPlan = async (retentionPlanRequest) => {
  const response = await api.post('/agent/retention-plan', retentionPlanRequest);
  return response.data;
};

export default api;
