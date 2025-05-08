// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ 
  allowedRoles = null, // Roles permitidos (array)
  redirectPath = '/login' // Ruta a redirigir si no está autenticado
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Mostrar indicador de carga mientras se verifica la autenticación
  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }
  
  // Verificar autenticación
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Verificar roles (si se especificaron)
  if (allowedRoles && user && !allowedRoles.includes(user.type)) {
    // Redirigir a la página adecuada según el tipo de usuario
    switch (user.type) {
      case 'cliente':
        return <Navigate to="/cliente/dashboard" replace />;
      case 'coach':
        return <Navigate to="/coach/dashboard" replace />;
      case 'administrador':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  // Si está autenticado y tiene el rol adecuado (o no se especificaron roles)
  return <Outlet />;
};

export default ProtectedRoute;