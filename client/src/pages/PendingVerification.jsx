// client/src/pages/PendingVerification.jsx
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Auth.css';

const PendingVerification = () => {
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail');
  
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendStatus, setResendStatus] = useState(''); // 'success', 'error'
  
  // Si no hay email, algo salió mal
  if (!email) {
    return (
      <div className="old-auth-container">
        <div className="verification-box">
          <h2 className="titulo">Error</h2>
          <p>No se pudo determinar tu correo electrónico. Por favor, intenta registrarte de nuevo.</p>
          <div className="verification-links">
            <Link to="/registro" className="verification-link">Volver a Registrarse</Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Función para reenviar el correo de verificación
  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage('');
    setResendStatus('');
    
    try {
      const response = await api.resendVerification(email);
      setResendMessage(response.message || 'Se ha enviado un nuevo correo de verificación.');
      setResendStatus('success');
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      setResendMessage(error.response?.data?.message || 'Error al enviar el correo de verificación.');
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="old-auth-container">
      <div className="verification-box">
        <h2 className="titulo">Verificación Pendiente</h2>
        
        <div className="verification-content">
          <div className="verification-icon">📧</div>
          
          <h3>Revisa tu correo electrónico</h3>
          
          <p>Hemos enviado un correo de verificación a:</p>
          <p className="verification-email">{email}</p>
          
          <p>Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.</p>
          
          <p className="verification-tip">
            <strong>Consejo:</strong> Si no encuentras el correo, revisa también tu carpeta de spam o correo no deseado.
          </p>
          
          {resendMessage && (
            <div className={`resend-message ${resendStatus}`}>
              {resendMessage}
            </div>
          )}
          
          <div className="verification-actions">
            <button 
              onClick={handleResendVerification}
              disabled={isResending}
              className="verification-btn"
            >
              {isResending ? 'Enviando...' : '¿No recibiste el correo? Reenviar'}
            </button>
            
            <Link to="/login" className="verification-link">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingVerification;