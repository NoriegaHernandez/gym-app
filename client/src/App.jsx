
// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import PendingVerification from './pages/PendingVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Páginas de cliente
import ClienteDashboard from './pages/cliente/Dashboard';
import Informacion from './pages/cliente/Informacion';
import Membresia from './pages/cliente/Membresia';
import Entrenadores from './pages/cliente/Entrenadores';
import PerfilUsuario from './pages/cliente/Perfilusuario';

// Otras páginas
import CoachDashboard from './pages/coach/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Componente para redirigir según tipo de usuario
const RedirectBasedOnRole = () => {
  const userType = localStorage.getItem('userType');
  
  switch(userType) {
    case 'cliente':
      return <Navigate to="/cliente/dashboard" />;
    case 'coach':
      return <Navigate to="/coach/dashboard" />;
    case 'administrador':
      return <Navigate to="/admin/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/verificar-email/:token" element={<VerifyEmail />} />
          <Route path="/registro-pendiente" element={<PendingVerification />} />
          <Route path="/recuperar-password" element={<ForgotPassword />} />
          <Route path="/restablecer-password/:token" element={<ResetPassword />} />
          
          {/* Rutas protegidas para clientes */}
          <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
            <Route path="/cliente/dashboard" element={<ClienteDashboard />} />
            <Route path="/cliente/informacion" element={<Informacion />} />
            <Route path="/cliente/membresia" element={<Membresia />} />
            <Route path="/cliente/entrenadores" element={<Entrenadores />} />
            <Route path="/cliente/perfil" element={<PerfilUsuario />} /> {}
            
          </Route>
          
          {/* Rutas protegidas para coaches */}
          <Route element={<ProtectedRoute allowedRoles={['coach']} />}>
            <Route path="/coach/dashboard" element={<CoachDashboard />} />
            {}
          </Route>
          
          {/* Rutas protegidas para administradores */}
          <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {}
          </Route>
          
          {/* Ruta por defecto para redirigir según tipo de usuario */}
          <Route path="/" element={<RedirectBasedOnRole />} />
          
          {/* Ruta para 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;