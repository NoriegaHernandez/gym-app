import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await api.forgotPassword(email);
      
      setIsSuccess(true);
      setMessage(response.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="old-auth-container">
      <div className="verification-box">
        <h2 className="titulo">Recuperar Contraseña</h2>
        
        {!isSuccess ? (
          <>
            <p className="auth-subtitle">Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña</p>
            
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="input-container">
                <span className="icon emoji-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="verification-btn"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar instrucciones"}
              </button>
            </form>
            
            <div className="auth-links">
              <Link to="/login" className="verification-link">Volver al inicio de sesión</Link>
            </div>
          </>
        ) : (
          <div className="verification-content">
            <div className="success-icon">✓</div>
            <h3>Solicitud enviada</h3>
            <p>{message}</p>
            <p>Revisa tu bandeja de entrada y sigue las instrucciones.</p>
            
            <div className="verification-actions">
              <Link to="/login" className="verification-btn">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;