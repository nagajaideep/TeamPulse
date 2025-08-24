import axios from 'axios';
import { API_BASE_URL } from './api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// API helper functions
export const apiCall = {
  get: (url, config = {}) => axios.get(url, config),
  post: (url, data, config = {}) => axios.post(url, data, config),
  put: (url, data, config = {}) => axios.put(url, data, config),
  delete: (url, config = {}) => axios.delete(url, config),
  patch: (url, data, config = {}) => axios.patch(url, data, config),
};

export default apiCall;
