// client/src/pages/cliente/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css'; 

const ClienteDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentExercise, setCurrentExercise] = useState(1);
  const totalExercises = 2; 
  const [hasCoach, setHasCoach] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Verificar si es la primera vez que inicia sesión o si ya tiene un entrenador asignado
    const checkCoachStatus = async () => {
      try {
       
        setHasCoach(false); // Cambiar a true si el usuario ya tiene un entrenador
        setIsFirstLogin(true); // Cambiar a false si no es la primera vez que inicia sesión
        
        // Si es la primera vez y no tiene entrenador, redirigir a la página de entrenadores
        if (isFirstLogin && !hasCoach) {
          navigate('/cliente/entrenadores');
        }
      } catch (error) {
        console.error('Error al verificar estado del entrenador:', error);
      }
    };
    
    checkCoachStatus();
  }, [user, navigate]);

  // Función para cambiar entre ejercicios
  const changeExercise = (direction) => {
    if (direction === 'next') {
      setCurrentExercise(currentExercise < totalExercises ? currentExercise + 1 : 1);
    } else {
      setCurrentExercise(currentExercise > 1 ? currentExercise - 1 : totalExercises);
    }
  };

  // Manejar el cierre de sesión
  const handleLogout = () => {
    // Llamar a la función logout del contexto de autenticación
    logout();
    // Redireccionar al usuario a la página de login
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
          <button className="menu-button disabled">Inicio</button>
          <button className="menu-button" onClick={() => navigate('/cliente/informacion')}>Informacion</button>
          <button className="menu-button" onClick={() => navigate('/cliente/membresia')}>Membresía</button>
          <button className="menu-button" onClick={() => navigate('/cliente/entrenadores')}>Entrenadores</button>
          <button className="menu-button" onClick={() => navigate('/cliente/PerfilUsuario')}>Mi Perfil</button>
          <button className="menu-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
      
      <div className="main-content">
        {!hasCoach && !isFirstLogin && (
          <div className="coach-banner">
            <p>No tienes un entrenador asignado. ¡Asigna uno para personalizar tu experiencia!</p>
            <button 
              className="banner-button"
              onClick={() => navigate('/cliente/entrenadores')}
            >
              Ver entrenadores disponibles
            </button>
          </div>
        )}
        
        <div className="user-card">
          <div className="user-avatar">
            {/* Icono de usuario */}
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
        
        <div id="exercises-container">
          {/* Ejercicio 1 */}
          <div 
            className="exercise-container" 
            id="exercise-1" 
            style={{display: currentExercise === 1 ? 'block' : 'none'}}
          >
            <div className="day-heading">
              <h2>Lunes</h2>
              <h2>Entrenamiento: <span>Pecho</span></h2>
            </div>
            
            <div className="exercise-content">
              <div className="exercise-image">   
                <img src="/src/assets/images/pressplano.png" alt="Press Banca" width="250" height="250" />
              </div>
              
              <div className="exercise-details" style={{textAlign: 'center'}}>
                <h3 className="exercise-title">Ejercicio: Press Banca</h3>
                <div className="exercise-description" style={{textAlign: 'center'}}>
                  Para este ejercicio, haremos 3 series a 12 repeticiones usando máximas de 25 lb (cada lado).
                </div>
                <div className="trainer-info" style={{textAlign: 'center'}}>
                  <p>Entrenador: CBLM</p>
                  <p>Horario: 13:00 - 22:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ejercicio 2 */}
          <div 
            className="exercise-container" 
            id="exercise-2" 
            style={{display: currentExercise === 2 ? 'block' : 'none'}}
          >
            <div className="day-heading">
              <h2>Martes</h2>
              <h2>Entrenamiento: <span>Espalda</span></h2>
            </div>
            
            <div className="exercise-content">
              <div className="exercise-image">
                <img src="/src/assets/images/dominadas.png" alt="Dominadas" width="250" height="250" />
              </div>
              
              <div className="exercise-details" style={{textAlign: 'center'}}>
                <h3 className="exercise-title">Ejercicio: Dominadas</h3>
                <div className="exercise-description" style={{textAlign: 'center'}}>
                  Para este ejercicio, haremos 4 series a 10 repeticiones con el peso corporal.
                </div>
                <div className="trainer-info" style={{textAlign: 'center'}}>
                  <p>Entrenador: CBLM</p>
                  <p>Horario: 13:00 - 22:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="navigation-buttons">
          <button className="nav-button" id="prev-button" onClick={() => changeExercise('prev')}>Anterior</button>
          <button className="nav-button" id="next-button" onClick={() => changeExercise('next')}>Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default ClienteDashboard;