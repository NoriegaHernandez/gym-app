import axios from 'axios';

// Definir la URL base de la API
const API_URL = 'http://localhost:5000';

// Configuración por defecto para axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir el token de autenticación a cada petición
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicios de API
const api = {
  // Prueba de conexión
  testConnection: async () => {
    try {
      const response = await axiosInstance.get('/');
      return response.data;
    } catch (error) {
      console.error('Error en la prueba de conexión:', error);
      throw error;
    }
  },
  
  // Aquí irían más métodos para interactuar con tu API...
};

export default api