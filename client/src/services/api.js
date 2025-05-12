// client/src/services/api.js
import axios from 'axios';

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios con configuración común
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Agregar interceptor para enviar el token en cada solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicios API
const api = {
  // Prueba de conexión
  testConnection: async () => {
    try {
      const response = await axiosInstance.get('/test');
      return response.data.message;
    } catch (error) {
      console.error('Error en la prueba de conexión:', error);
      throw error;
    }
  },
  
  // Autenticación
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },


testRegister: async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/test-register', userData);
    return response.data;
  } catch (error) {
    console.error('Error en test-register:', error);
    throw error;
  }
},
  
  verifyToken: async () => {
    try {
      const response = await axiosInstance.post('/auth/verify-token');
      return response.data;
    } catch (error) {
      console.error('Error al verificar token:', error);
      throw error;
    }
  },
  

  
getCurrentUser: async () => {
  try {
    console.log('Iniciando solicitud getCurrentUser');
    
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token almacenado en localStorage');
      throw new Error('No hay token de autenticación');
    }
    

    console.log('Cabeceras de la solicitud:', {
      'Content-Type': 'application/json',
      'x-auth-token': token.substring(0, 10) + '...'
    });
    
    // Hacer la solicitud con manejo explícito de respuesta
    const response = await axiosInstance.get('/auth/me');
    
    // Verificar si la respuesta es exitosa
    if (response.status !== 200) {
      console.error('Respuesta con código de error:', response.status);
      throw new Error(`Error en la respuesta: ${response.status}`);
    }
    
    // Verificar si hay datos en la respuesta
    if (!response.data) {
      console.error('La respuesta no contiene datos');
      throw new Error('La respuesta no contiene datos del usuario');
    }
    
    console.log('Datos del usuario obtenidos correctamente:', {
      id: response.data.id_usuario,
      nombre: response.data.nombre,
      email: response.data.email,
      tipoUsuario: response.data.tipo_usuario
    });
    
    return response.data;
  } catch (error) {
    // Manejo detallado de errores
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error de respuesta del servidor:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Mensaje específico según el código de error
      if (error.response.status === 401) {
        console.error('Error de autenticación: Token inválido o expirado');
        // Limpiar token y redirigir al login
        localStorage.removeItem('token');
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else if (error.response.status === 404) {
        console.error('Ruta no encontrada. Verificar URL de la API');
        throw new Error('Servicio no disponible. Por favor contacte al administrador.');
      } else {
        console.error(`Error ${error.response.status}: ${error.response.data.message || 'Error del servidor'}`);
        throw new Error(error.response.data.message || 'Error al obtener datos del usuario');
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      // Error en la configuración de la solicitud
      console.error('Error al configurar la solicitud:', error.message);
      throw new Error('Error en la aplicación. Por favor contacte al administrador.');
    }
  }
  },


// Función para verificar el email con el token
verifyEmail: async (token) => {
  try {
    const response = await axiosInstance.get(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    console.error('Error al verificar email:', error);
    throw error;
  }
},


// Función para solicitar restablecimiento de contraseña
forgotPassword: async (email) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    throw error;
  }
},

// Función para verificar token de restablecimiento
verifyResetToken: async (token) => {
  try {
    const response = await axiosInstance.get(`/auth/reset-password/${token}`);
    return response.data;
  } catch (error) {
    console.error('Error al verificar token de restablecimiento:', error);
    throw error;
  }
},


// Función para restablecer contraseña
resetPassword: async (token, password) => {
  try {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    throw error;
  }
},

// Función para reenviar el correo de verificación
resendVerification: async (email) => {
  try {
    const response = await axiosInstance.post('/auth/resend-verification', { email });
    return response.data;
  } catch (error) {
    console.error('Error al reenviar verificación:', error);
    throw error;
  }
},

// Coaches - Admin
getCoaches: async () => {
  try {
    const response = await axiosInstance.get('/coach');
    return response;
  } catch (error) {
    console.error('Error al obtener coaches:', error);
    throw error;
  }
},

createCoach: async (coachData) => {
  try {
    const response = await axiosInstance.post('/coach', coachData);
    return response;
  } catch (error) {
    console.error('Error al crear coach:', error);
    throw error;
  }
},

// Coaches - Cliente
getAvailableCoaches: async () => {
  try {
    const response = await axiosInstance.get('/client/coaches');
    return response;
  } catch (error) {
    console.error('Error al obtener entrenadores disponibles:', error);
    throw error;
  }
},

getCoachClients: async () => {
  try {
    const response = await axiosInstance.get('/coach/clients');
    return response;
  } catch (error) {
    console.error('Error al obtener clientes del coach:', error);
    // Devolver un array vacío en caso de error para evitar errores en el frontend
    return { data: [] };
  }
},

getCoachPendingRequests: async () => {
  try {
    const response = await axiosInstance.get('/coach/pending-requests');
    return response;
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    // Devolver un array vacío en caso de error para evitar errores en el frontend
    return { data: [] };
  }
},

acceptClientRequest: async (requestId) => {
  try {
    const response = await axiosInstance.post(`/coach/accept-request/${requestId}`);
    return response;
  } catch (error) {
    console.error('Error al aceptar solicitud:', error);
    throw error;
  }
},

rejectClientRequest: async (requestId) => {
  try {
    const response = await axiosInstance.post(`/coach/reject-request/${requestId}`);
    return response;
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    throw error;
  }
},

getCoachStatus: async () => {
  try {
    const response = await axiosInstance.get('/client/coach-status');
    return response;
  } catch (error) {
    console.error('Error al obtener estado del entrenador:', error);
    // Si el error es 404, devuelve un estado predeterminado
    if (error.response?.status === 404) {
      return { 
        data: { 
          hasCoach: false, 
          pendingRequest: false 
        } 
      };
    }
    throw error;
  }
},

requestCoach: async (coachId) => {
  try {
    const response = await axiosInstance.post(`/client/request-coach/${coachId}`);
    return response;
  } catch (error) {
    console.error('Error al solicitar entrenador:', error);
    // Mejorar el manejo de errores
    if (error.response?.status === 404) {
      throw new Error('La funcionalidad para solicitar entrenador no está disponible en este momento. Por favor, inténtalo más tarde.');
    }
    throw error;
  }
},

// Obtener detalles de un coach específico (Admin)
getCoachById: async (coachId) => {
  try {
    const response = await axiosInstance.get(`/coach/${coachId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener detalles del coach:', error);
    throw error;
  }
},

// Modificar un coach existente (Admin)
updateCoach: async (coachId, coachData) => {
  try {
    const response = await axiosInstance.put(`/coach/${coachId}`, coachData);
    return response;
  } catch (error) {
    console.error('Error al actualizar coach:', error);
    throw error;
  }
},

// Eliminar un coach (Admin)
deleteCoach: async (coachId) => {
  try {
    const response = await axiosInstance.delete(`/coach/${coachId}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar coach:', error);
    throw error;
  }
},

// Gestión de usuarios (Admin)
getUsers: async () => {
  try {
    const response = await axiosInstance.get('/admin/users');
    return response;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
},

createUser: async (userData) => {
  try {
    const response = await axiosInstance.post('/admin/users', userData);
    return response;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
},

updateUser: async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
    return response;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
},

deleteUser: async (userId) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
},

// Función para obtener estadísticas del dashboard
getAdminStats: async (timeframe = 'month') => {
  try {
    console.log(`Solicitando estadísticas con timeframe: ${timeframe}`);
    const response = await axiosInstance.get(`/admin/dashboard/stats?timeframe=${timeframe}`);
    console.log('Respuesta de estadísticas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    // En caso de error, devolver un objeto con valores a cero
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalCoaches: 0,
      activeSubscriptions: 0,
      pendingVerifications: 0
    };
  }
},

// Función para obtener datos comparativos para estadísticas
getStatsComparison: async (timeframe = 'month') => {
  try {
    console.log(`Solicitando datos comparativos con timeframe: ${timeframe}`);
    const response = await axiosInstance.get(`/admin/dashboard/stats/comparison?timeframe=${timeframe}`);
    console.log('Respuesta de datos comparativos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos comparativos:', error);
    // En caso de error, devolver un objeto con valores a cero
    return {
      totalUsers: { current: 0, previous: 0 },
      activeUsers: { current: 0, previous: 0 },
      totalCoaches: { current: 0, previous: 0 },
      activeSubscriptions: { current: 0, previous: 0 }
    };
  }
},

// Función para obtener actividad reciente
getRecentActivity: async (filters = {}) => {
  try {
    // Construir query params
    const params = new URLSearchParams();
    
    if (filters.type) {
      params.append('type', filters.type);
    }
    
    if (filters.timeFilter) {
      params.append('timeFilter', filters.timeFilter);
    }
    
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    console.log(`Solicitando actividad reciente con filtros: ${queryString}`);
    
    const response = await axiosInstance.get(`/admin/dashboard/activity${queryString}`);
    console.log('Respuesta de actividad reciente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    return []; // Devolver array vacío en caso de error
  }
},

// Función para obtener verificaciones pendientes
getPendingVerifications: async () => {
  try {
    const response = await axiosInstance.get('/admin/verification/pending');
    console.log('Respuesta de verificaciones pendientes:', response.data);
    return response.data.count || 0;
  } catch (error) {
    console.error('Error al obtener verificaciones pendientes:', error);
    return 0;
  }
},

requestProfileUpdate: async (userData) => {
  try {
    const response = await axiosInstance.post('/client/profile/update-request', userData);
    return response.data;
  } catch (error) {
    console.error('Error al solicitar actualización de perfil:', error);
    throw error;
  }
},
// Función para solicitar actualización de perfil
requestProfileUpdate: async (userData) => {
  try {
    const response = await axiosInstance.post('/client/profile/update-request', userData);
    return response.data;
  } catch (error) {
    console.error('Error al solicitar actualización de perfil:', error);
    throw error;
  }
},

// Funciones para el administrador (para manejar solicitudes de actualización)
getProfileUpdateRequests: async () => {
  try {
    const response = await axiosInstance.get('/admin/profile-requests');
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes de actualización de perfil:', error);
    return []; // Devolver array vacío en caso de error
  }
},

approveProfileUpdate: async (requestId) => {
  try {
    const response = await axiosInstance.post(`/admin/profile-requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error al aprobar solicitud de actualización de perfil:', error);
    throw error;
  }
},

rejectProfileUpdate: async (requestId) => {
  try {
    const response = await axiosInstance.post(`/admin/profile-requests/${requestId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Error al rechazar solicitud de actualización de perfil:', error);
    throw error;
  }
},


updateProfile: async (userData) => {
  try {
    console.log('Enviando datos para actualizar perfil:', userData);
    
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token almacenado en localStorage');
      throw new Error('No hay token de autenticación');
    }
    
    // Hacer la solicitud con manejo explícito de respuesta
    const response = await axiosInstance.put('/auth/profile', userData);
    
    // Verificar si la respuesta es exitosa
    if (response.status !== 200) {
      console.error('Respuesta con código de error:', response.status);
      throw new Error(`Error en la respuesta: ${response.status}`);
    }
    
    // Verificar si hay datos en la respuesta
    if (!response.data) {
      console.error('La respuesta no contiene datos');
      throw new Error('La respuesta no contiene datos del usuario');
    }
    
    console.log('Perfil actualizado correctamente:', response.data);
    return response.data;
  } catch (error) {
    // Manejo detallado de errores
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error de respuesta del servidor:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Mensaje específico según el código de error
      if (error.response.status === 401) {
        console.error('Error de autenticación: Token inválido o expirado');
        // Limpiar token y redirigir al login
        localStorage.removeItem('token');
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else if (error.response.status === 403) {
        console.error('Error de permisos: No autorizado para realizar esta acción');
        throw new Error('No tienes permisos para actualizar el perfil.');
      } else {
        console.error(`Error ${error.response.status}: ${error.response.data.message || 'Error del servidor'}`);
        throw new Error(error.response.data.message || 'Error al actualizar el perfil.');
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      // Error en la configuración de la solicitud
      console.error('Error al configurar la solicitud:', error.message);
      throw new Error('Error en la aplicación. Por favor contacte al administrador.');
    }
  }
},


// Función para actualizar la contraseña
updatePassword: async (currentPassword, newPassword) => {
  try {
    const response = await axiosInstance.put('/auth/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    throw error;
  }
},

// Función para obtener todos los datos del perfil
getProfileDetails: async () => {
  try {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles del perfil:', error);
    throw error;
  }
},

// Si el usuario es un cliente y tiene entrenador, obtener info del entrenador
getMyCoach: async () => {
  try {
    const response = await axiosInstance.get('/client/my-coach');
    return response.data;
  } catch (error) {
    console.error('Error al obtener información del entrenador:', error);
    // Si el error es 404, significa que no tiene entrenador asignado
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
},

// Si el usuario es un entrenador, obtener sus estadísticas
getCoachStats: async () => {
  try {
    const response = await axiosInstance.get('/coach/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas del entrenador:', error);
    // Devolver objeto vacío en caso de error
    return {};
  }
},

// Si el usuario es cliente, obtener estadísticas de progreso
getClientProgress: async () => {
  try {
    const response = await axiosInstance.get('/client/progress');
    return response.data;
  } catch (error) {
    console.error('Error al obtener progreso del cliente:', error);
    // Devolver objeto vacío en caso de error
    return {};
  }
},

// Obtener información de membresía (para clientes)
getMembershipInfo: async () => {
  try {
    const response = await axiosInstance.get('/client/membership');
    return response.data;
  } catch (error) {
    console.error('Error al obtener información de membresía:', error);
    // Si el error es 404, significa que no tiene membresía activa
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
},

// Obtener el perfil del usuario actual (usando la vista segura)
getUserProfile: async () => {
  try {
    console.log('Solicitando perfil de usuario');
    const response = await axiosInstance.get('/auth/profile');
    console.log('Respuesta de perfil:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    throw error;
  }
},

// Actualizar el perfil del usuario actual (usando el procedimiento almacenado seguro)
updateUserProfile: async (profileData) => {
  try {
    console.log('Enviando actualización de perfil:', profileData);
    const response = await axiosInstance.put('/auth/profile', profileData);
    console.log('Respuesta de actualización:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    throw error;
  }
},

// Cambiar la contraseña del usuario actual
changePassword: async (currentPassword, newPassword) => {
  try {
    console.log('Solicitando cambio de contraseña');
    const response = await axiosInstance.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    console.log('Respuesta de cambio de contraseña:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
},

// Obtener las suscripciones del usuario actual
getUserSubscriptions: async () => {
  try {
    console.log('Solicitando suscripciones de usuario');
    const response = await axiosInstance.get('/auth/subscriptions');
    console.log('Respuesta de suscripciones:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener suscripciones:', error);
    return []; // Retornar array vacío en caso de error
  }
},

// Obtener la asignación de entrenador del usuario actual
getUserCoachAssignment: async () => {
  try {
    console.log('Solicitando asignación de entrenador');
    const response = await axiosInstance.get('/auth/coach-assignment');
    console.log('Respuesta de asignación de entrenador:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener asignación de entrenador:', error);
    return null; // Retornar null en caso de error
  }
},

// Obtener las notificaciones del usuario actual
getUserNotifications: async () => {
  try {
    console.log('Solicitando notificaciones de usuario');
    const response = await axiosInstance.get('/auth/notifications');
    console.log('Respuesta de notificaciones:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return []; // Retornar array vacío en caso de error
  }

},

// Funciones para la gestión de membresías desde el panel de administración

// Obtener usuarios con sus datos de membresía
getUsersWithMemberships: async () => {
  try {
    const response = await axiosInstance.get('/admin/users-with-memberships');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios con membresías:', error);
    throw error;
  }
},

// Obtener todos los planes disponibles
getAvailablePlans: async () => {
  try {
    const response = await axiosInstance.get('/admin/plans');
    return response.data;
  } catch (error) {
    console.error('Error al obtener planes disponibles:', error);
    throw error;
  }
},

// Crear una nueva membresía
createMembership: async (membershipData) => {
  try {
    const response = await axiosInstance.post('/admin/memberships', membershipData);
    return response.data;
  } catch (error) {
    console.error('Error al crear membresía:', error);
    throw error;
  }
},

// Actualizar una membresía existente
updateMembership: async (id, membershipData) => {
  try {
    const response = await axiosInstance.put(`/admin/memberships/${id}`, membershipData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar membresía:', error);
    throw error;
  }
},

// Cancelar una membresía
cancelMembership: async (id) => {
  try {
    const response = await axiosInstance.post(`/admin/memberships/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar membresía:', error);
    throw error;
  }
},

// Renovar una membresía
renewMembership: async (id, membershipData) => {
  try {
    const response = await axiosInstance.post(`/admin/memberships/${id}/renew`, membershipData);
    return response.data;
  } catch (error) {
    console.error('Error al renovar membresía:', error);
    throw error;
  }
},

// Obtener historial de membresías de un usuario
getUserMembershipHistory: async (userId) => {
  try {
    const response = await axiosInstance.get(`/admin/users/${userId}/membership-history`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de membresías:', error);
    throw error;
  }
},

// Actualización para api.js para funcionar con SQL Server

// Función para probar la conexión
testConnection: async () => {
  try {
    const response = await axiosInstance.get('/test');
    console.log('Conexión exitosa al servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en la prueba de conexión:', error);
    throw error;
  }
},

// Funciones para clientes - sección de membresías
getCurrentUserMembership: async () => {
  try {
    console.log('Solicitando información de membresía del usuario actual');
    const response = await axiosInstance.get('/usuarios/current/membresia');
    console.log('Respuesta de membresía recibida:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener membresía del usuario:', error);
    
    // Incluso en caso de error, devolvemos un estado mínimo para evitar errores en la UI
    return { 
      estado_membresia: 'inactiva',
      // Si tenemos información del usuario, incluirla
      id_usuario: localStorage.getItem('userId') || null,
    };
  }
},

getClientAvailablePlans: async () => {
  try {
    console.log('Solicitando planes disponibles para el cliente');
    const response = await axiosInstance.get('/planes');
    console.log('Planes disponibles recibidos:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener planes disponibles:', error);
    return []; // Retornar array vacío en caso de error
  }
},

createClientMembership: async (membershipData) => {
  try {
    console.log('Creando nueva membresía para el cliente:', membershipData);
    
    // Validar datos antes de enviar
    if (!membershipData.id_plan || !membershipData.tipo_plan) {
      throw new Error('Datos incompletos para crear membresía');
    }
    
    const response = await axiosInstance.post('/membresias', membershipData);
    console.log('Respuesta de creación de membresía:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear membresía para el cliente:', error);
    throw error;
  }
},

renewClientMembership: async (id_suscripcion, membershipData) => {
  try {
    console.log('Renovando membresía:', id_suscripcion, membershipData);
    
    // Validar datos antes de enviar
    if (!membershipData.id_plan || !membershipData.tipo_plan) {
      throw new Error('Datos incompletos para renovar membresía');
    }
    
    const response = await axiosInstance.put(`/membresias/${id_suscripcion}/renovar`, membershipData);
    console.log('Respuesta de renovación de membresía:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al renovar membresía:', error);
    throw error;
  }
},

cancelClientMembership: async (id_suscripcion) => {
  try {
    console.log('Cancelando membresía:', id_suscripcion);
    const response = await axiosInstance.put(`/membresias/${id_suscripcion}/cancelar`);
    console.log('Respuesta de cancelación de membresía:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar membresía:', error);
    throw error;
  }
},

// Esta función es opcional, sólo si necesitas ver el historial
getClientMembershipHistory: async () => {
  try {
    console.log('Solicitando historial de membresías');
    const response = await axiosInstance.get('/membresias/historial');
    console.log('Historial de membresías recibido:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener historial de membresías:', error);
    return []; // Retornar array vacío en caso de error
  }
}
};

export default api;