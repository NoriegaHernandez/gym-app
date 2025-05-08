
// client/src/pages/cliente/Membresia.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css'; // Reutilizamos los estilos

const Membresia = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para navegar al perfil de usuario
  const navigateToProfile = () => {
    navigate('/cliente/perfil');
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-circle">
            <img src="/src/assets/icons/logo.png" alt="Logo Gimnasio" width="60" height="60" />
          </div>
        </div>
        
        <div className="menu-buttons">
          <button className="menu-button" onClick={() => navigate('/cliente/dashboard')}>Inicio</button>
          <button className="menu-button" onClick={() => navigate('/cliente/informacion')}>Información</button>
          <button className="menu-button disabled">Membresía</button>
          <button className="menu-button" onClick={() => navigate('/cliente/entrenadores')}>Entrenadores</button>

          <button className="menu-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="user-card">
          <div className="user-avatar">
            <img src="/src/assets/icons/usuario.png" alt="Avatar" width="50" height="50" />
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Usuario'}</div>
            <div className="membership-details">
              <span>Estado de la membresía: Activa</span>
              <span>Fecha de vencimiento: 24 - Enero - 2026</span>
            </div>
          </div>
        </div>
        
        <div className="membership-container">
          <h2>Tu Membresía</h2>
          
          <div className="membership-card">
            <div className="membership-header">
              <h3>Membresía Actual</h3>
              <span className="membership-status">Activa</span>
            </div>
            
            <div className="membership-details-expanded">
              <p><strong>Plan:</strong> Mensual</p>
              <p><strong>Fecha de inicio:</strong> 24 - Diciembre - 2023</p>
              <p><strong>Fecha de vencimiento:</strong> 24 - Enero - 2026</p>
              <p><strong>Precio:</strong> $500 MXN</p>
            </div>
            
            <div className="membership-benefits">
              <h4>Beneficios incluidos:</h4>
              <ul>
                <li>Acceso ilimitado al gimnasio</li>
                <li>Área de cardio y pesas</li>
                <li>Acceso a vestidores</li>
                <li>2 clases grupales gratuitas por semana</li>
              </ul>
            </div>
            
            <button className="renew-button">Renovar Membresía</button>
          </div>
          
          <div className="other-plans">
            <h3>Otros planes disponibles</h3>
            
            <div className="plan-cards">
              <div className="plan-card">
                <h4>Plan Trimestral</h4>
                <p className="plan-price">$1,350 MXN</p>
                <p className="price-savings">Ahorra 10%</p>
                <button className="plan-button">Cambiar Plan</button>
              </div>
              
              <div className="plan-card">
                <h4>Plan Anual</h4>
                <p className="plan-price">$5,000 MXN</p>
                <p className="price-savings">Ahorra 15%</p>
                <button className="plan-button">Cambiar Plan</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membresia;