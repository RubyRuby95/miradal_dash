import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://miradal-api.vercel.app',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
});

export default apiClient;