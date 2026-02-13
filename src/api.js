import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`📤 [Frontend] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`📥 [Frontend] Response ${response.status} from ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ [Frontend] Error from ${error.config?.url}:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
