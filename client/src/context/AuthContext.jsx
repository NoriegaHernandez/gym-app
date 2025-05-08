
// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// Crear contexto
export const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un token al cargar
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Verificar validez del token
          const response = await api.verifyToken();
          
          if (response.valid) {
            // Obtener datos del usuario
            const userData = await api.getCurrentUser();
            setUser(userData);
          } else {
            // Token inválido, limpiar almacenamiento
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userType');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // Limpiar almacenamiento si hay error
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  // Función para iniciar sesión
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.login(email, password);
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id);
      localStorage.setItem('userType', response.user.type);
      
      // Actualizar estado
      setUser(response.user);
      
      return response.user;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      // Si es un error de verificación pendiente, propagar para manejarlo en el componente
      if (error.response?.data?.requiresVerification) {
        setError(error.response.data.message);
        throw error; // Propagar el error para manejarlo en el componente
      } else {
        setError(error.response?.data?.message || 'Error al iniciar sesión');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Función para registrarse
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.register(userData);
      
      // Verificar si se requiere verificación de email
      if (response.requiresVerification) {
        // Guardar email para posible reenvío de verificación
        localStorage.setItem('pendingVerificationEmail', response.email);
        
        // No establecer el usuario como autenticado hasta la verificación
        setUser(null);
        
        return { requiresVerification: true, email: response.email };
      } else {
        // Si no se requiere verificación, proceder como antes
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userType', response.user.type);
        
        // Actualizar estado
        setUser(response.user);
        
        return response.user;
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError(error.response?.data?.message || 'Error al registrar usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Limpiar almacenamiento
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('pendingVerificationEmail');
    
    // Actualizar estado
    setUser(null);
  };
  
  // Función para reenviar verificación de email
  const resendVerification = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.resendVerification(email);
      return response;
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      setError(error.response?.data?.message || 'Error al reenviar verificación');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Proporcionar valores del contexto
const value = {
  user,
  setUser,  
  loading,
  error,
  login,
  register,
  logout,
  resendVerification,
  isAuthenticated: !!user
};
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};