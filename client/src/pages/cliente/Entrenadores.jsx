// client/src/pages/cliente/Entrenadores.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

const Entrenadores = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [currentCoach, setCurrentCoach] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [coachStatus, setCoachStatus] = useState({
    hasCoach: false,
    pendingRequest: false,
    coach: null
  });

  // Verificar estado de asignación de entrenador
  useEffect(() => {
    const checkCoachStatus = async () => {
      try {
        const response = await api.getCoachStatus();
        setCoachStatus(response.data);
        
        // Si ya tiene una solicitud pendiente o un entrenador asignado, mostrar mensaje
        if (response.data.hasCoach || response.data.pendingRequest) {
          setRequestSent(true);
          setRequestSuccess(true);
        }
      } catch (error) {
        console.error('Error al verificar estado del entrenador:', error);
      }
    };
    
    checkCoachStatus();
  }, []);

  // Cargar entrenadores disponibles
  useEffect(() => {
    const loadCoaches = async () => {
      if (coachStatus.hasCoach || coachStatus.pendingRequest) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.getAvailableCoaches();
        setCoaches(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar entrenadores:', error);
        setError('Error al cargar entrenadores. Por favor, inténtalo de nuevo más tarde.');
        setLoading(false);
      }
    };

    loadCoaches();
  }, [coachStatus]);

  // Función para cambiar entre entrenadores
  const changeCoach = (direction) => {
    if (coaches.length === 0) return;
    
    if (direction === 'next') {
      setCurrentCoach((prev) => (prev < coaches.length - 1 ? prev + 1 : 0));
    } else {
      setCurrentCoach((prev) => (prev > 0 ? prev - 1 : coaches.length - 1));
    }
  };

  // Función para enviar solicitud al entrenador
  const sendCoachRequest = async () => {
    if (coaches.length === 0) return;
    
    try {
      setLoading(true);
      const selectedCoach = coaches[currentCoach];
      
      await api.requestCoach(selectedCoach.id_coach);
      
      setRequestSent(true);
      setRequestSuccess(true);
      setCoachStatus({
        hasCoach: false,
        pendingRequest: true,
        coach: {
          id: selectedCoach.id_coach,
          name: selectedCoach.nombre,
          specialization: selectedCoach.especialidad
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      setRequestSent(true);
      setRequestSuccess(false);
      setError(error.response?.data?.message || 'Error al enviar solicitud');
      setLoading(false);
    }
  };

  // Manejar el cierre de sesión
  const handleLogout = () => {
    // Llamar a la función logout del contexto de autenticación
    logout();
    // Redireccionar al usuario a la página de login
    navigate('/login');
  };

  // Renderizar mensaje para usuario con entrenador o solicitud pendiente
  const renderCoachStatusMessage = () => {
    if (coachStatus.hasCoach) {
      return (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h3>Ya tienes un entrenador asignado</h3>
          <p>Tu entrenador actual es: <strong>{coachStatus.coach.name}</strong></p>
          <p>Especialidad: {coachStatus.coach.specialization}</p>
          <button 
            className="coach-button primary"
            onClick={() => navigate('/cliente/dashboard')}
          >
            Volver al Dashboard
          </button>
        </div>
      );
    }
    
    if (coachStatus.pendingRequest) {
      return (
        <div className="pending-message">
          <div className="pending-icon">⌛</div>
          <h3>Solicitud pendiente</h3>
          <p>Has enviado una solicitud al entrenador <strong>{coachStatus.coach.name}</strong></p>
          <p>Tu solicitud está siendo procesada. Te notificaremos cuando sea aceptada.</p>
          <button 
            className="coach-button primary"
            onClick={() => navigate('/cliente/dashboard')}
          >
            Volver al Dashboard
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-circle">
            <img src="/logo.png" alt="Logo Gimnasio" className="logo-img"/>
          </div>
        </div>
        
        <div className="menu-buttons">
          <button className="menu-button" onClick={() => navigate('/cliente/dashboard')}>Inicio</button>
          <button className="menu-button" onClick={() => navigate('/cliente/informacion')}>Información</button>
          <button className="menu-button" onClick={() => navigate('/cliente/membresia')}>Membresía</button>
          <button className="menu-button disabled">Entrenadores</button>
          <button className="menu-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="user-card">
          <div className="user-avatar">
            <div className="avatar-circle">
              <img src="/src/assets/icons/usuario.png" alt="Avatar" width="50" height="50" />
            </div>
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Usuario'}</div>
            <div className="membership-details">
              <span>Estado de la membresía: Activa</span>
              <span>Fecha de vencimiento: 24 - Enero - 2026</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando información...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <div className="error-icon">✗</div>
            <h3>Error</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Intentar de nuevo
            </button>
          </div>
        ) : requestSent || coachStatus.hasCoach || coachStatus.pendingRequest ? (
          <div className="coach-status-container">
            {renderCoachStatusMessage()}
            
            {requestSent && !coachStatus.hasCoach && !coachStatus.pendingRequest && (
              requestSuccess ? (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <h3>Solicitud enviada con éxito</h3>
                  <p>Tu solicitud ha sido enviada al entrenador.</p>
                  <p>Te notificaremos cuando sea aceptada.</p>
                  <button 
                    className="coach-button primary"
                    onClick={() => navigate('/cliente/dashboard')}
                  >
                    Volver al Dashboard
                  </button>
                </div>
              ) : (
                <div className="error-message">
                  <div className="error-icon">✗</div>
                  <h3>Error al enviar solicitud</h3>
                  <p>{error || 'Ha ocurrido un error al enviar tu solicitud. Por favor, inténtalo de nuevo.'}</p>
                  <button 
                    className="retry-button"
                    onClick={() => setRequestSent(false)}
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )
            )}
          </div>
        ) : coaches.length === 0 ? (
          <div className="empty-coaches">
            <h3>No hay entrenadores disponibles</h3>
            <p>En este momento no hay entrenadores disponibles. Vuelve a intentarlo más tarde.</p>
          </div>
        ) : (
          <>
            <div className="coach-header">
              <button className="nav-arrow" onClick={() => changeCoach('prev')}>←</button>
              <h2>Entrenadores Disponibles</h2>
              <button className="nav-arrow" onClick={() => changeCoach('next')}>→</button>
            </div>
            
            <div className="coach-container">
              <div className="coach-info">
                <h3>{coaches[currentCoach].nombre}</h3>
                
                <div className="coach-content">
                  <div className="coach-image">
                    <img 
                      src={`/src/assets/images/coach${currentCoach + 1}.jpg`} 
                      alt={coaches[currentCoach].nombre} 
                      width="300" 
                      height="300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/src/assets/icons/usuario.png";
                      }}
                    />
                  </div>
                  
                  <div className="coach-details">
                    <div className="coach-description">
                      <p><strong>Especialidad:</strong> {coaches[currentCoach].especialidad}</p>
                      {coaches[currentCoach].certificaciones && (
                        <p><strong>Certificaciones:</strong> {coaches[currentCoach].certificaciones}</p>
                      )}
                      {coaches[currentCoach].biografia && (
                        <p>{coaches[currentCoach].biografia}</p>
                      )}
                    </div>
                    
                    {coaches[currentCoach].horario_disponible && (
                      <div className="coach-schedule">
                        <p><strong>Horario disponible:</strong></p>
                        <p>{coaches[currentCoach].horario_disponible}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="coach-request">
                  <button 
                    className="request-button"
                    onClick={sendCoachRequest}
                    disabled={loading}
                  >
                    {loading ? "Enviando solicitud..." : "Solicitar este entrenador"}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="coach-pagination">
              {coaches.map((_, index) => (
                <button 
                  key={index}
                  className={`pagination-dot ${index === currentCoach ? 'active' : ''}`}
                  onClick={() => setCurrentCoach(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Entrenadores;