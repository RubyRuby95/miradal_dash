import axios from 'axios';

const apiClient = axios.create({
  //baseURL: 'https://servicio-api.vercel.app/api',
  baseURL: "../../public/data/respuestas.json",
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
});

export default apiClient;