// client/src/pages/VerifyEmail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Auth.css';


const VerifyEmail = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); 
  const [message, setMessage] = useState('Verificando tu correo electrónico...');
  const { setUser } = useAuth();
  
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Llamar a la API para verificar el token
        const response = await api.verifyEmail(token);
        
        // Actualizar el estado de autenticación
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.user.id);
          localStorage.setItem('userType', response.user.type);
          setUser(response.user);
        }
        
        setVerificationStatus('success');
        setMessage('¡Tu correo electrónico ha sido verificado correctamente!');
        
        // Redireccionar al dashboard después de 3 segundos
        setTimeout(() => {
          navigate('/cliente/dashboard');
        }, 3000);
        
      } catch (error) {
        console.error('Error al verificar email:', error);
        
        if (error.response?.status === 400) {
          if (error.response.data.message.includes('expirado')) {
            setVerificationStatus('expired');
            setMessage('El enlace de verificación ha expirado. Por favor, solicita un nuevo enlace.');
          } else {
            setVerificationStatus('invalid');
            setMessage('Verificando tu cuenta, por favor espera un momento...');
          }
        } else {
          setVerificationStatus('error');
          setMessage('Ha ocurrido un error al verificar tu correo electrónico. Por favor, inténtalo de nuevo más tarde.');
        }
      }
    };
    
    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus('invalid');
      setMessage('El enlace de verificación no es válido.');
    }
  }, [token, navigate, setUser]);

  // Función para solicitar un nuevo enlace
  const handleResendVerification = async () => {
    try {
      // Obtener el email del almacenamiento local (si lo guardamos durante el registro)
      const email = localStorage.getItem('pendingVerificationEmail');
      
      if (!email) {
        setMessage('No se pudo determinar tu correo electrónico. Por favor, intenta registrarte de nuevo.');
        return;
      }
      
      await api.resendVerification(email);
      setMessage('Se ha enviado un nuevo enlace de verificación a tu correo electrónico.');
      
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      setMessage('Ha ocurrido un error al enviar el enlace de verificación. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  // Renderizar diferentes mensajes según el estado
  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="verification-loading">
            <div className="spinner"></div>
            <p>{message}</p>
          </div>
        );
        
      case 'success':
        return (
          <div className="verification-success">
            <div className="success-icon">✓</div>
            <h3>¡Verificación Exitosa!</h3>
            <p>{message}</p>
            <p>Redireccionando al dashboard...</p>
          </div>
        );
        
      case 'expired':
        return (
          <div className="verification-expired">
            <div className="expired-icon">⚠️</div>
            <h3>Enlace Expirado</h3>
            <p>{message}</p>
            <button onClick={handleResendVerification} className="verification-btn">
              Enviar Nuevo Enlace
            </button>
          </div>
        );
        
      case 'invalid':
      case 'error':
      default:
        return (
          <div className="verification-error">
            <div className="error-icon" src="C:\Users\norie\gym-app\client\images\cargando.webn"></div>
            <h3>Verificando...</h3>
            <p>{message}</p>
            <div className="verification-links">
              <Link to="/registro" className="verification-link">Volver a Registrarse</Link>
              <Link to="/login" className="verification-link">Iniciar Sesión</Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="old-auth-container">
      <div className="verification-box">
        <h2 className="titulo">Verificación de Correo</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmail;