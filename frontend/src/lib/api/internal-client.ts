import axios from 'axios';

// Client API pour les requêtes serveur-side (NextAuth)
// Utilise l'URL interne Docker pour la communication entre conteneurs
console.log('Internal API URL:', process.env.INTERNAL_API_URL);

const internalApiClient = axios.create({
  baseURL: process.env.INTERNAL_API_URL || 'http://backend:8000/api/v1',
  timeout: 10000,
});

internalApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject(error.response);
    }
    return Promise.reject(error);
  }
);

export default internalApiClient;