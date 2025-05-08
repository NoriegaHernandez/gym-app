import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenStatus, setTokenStatus] = useState('verifying'); // 'verifying', 'valid', 'invalid', 'expired'
  const [message, setMessage] = useState('Verificando enlace...');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Verificar token al cargar el componente
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.verifyResetToken(token);
        setTokenStatus('valid');
        setMessage('');
      } catch (err) {
        if (err.response?.status === 400) {
          if (err.response?.data?.message?.includes('expirado')) {
            setTokenStatus('expired');
            setMessage('El enlace de restablecimiento ha expirado. Por favor, solicita uno nuevo.');
          } else {
            setTokenStatus('invalid');
            setMessage('El enlace de restablecimiento no es válido.');
          }
        } else {
          setTokenStatus('invalid');
          setMessage('Error al verificar el enlace. Por favor, inténtalo de nuevo.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await api.resetPassword(token, password);
      
      setIsSuccess(true);
      setMessage(response.message);
      
      // Redireccionar después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer contraseña');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Renderizar según el estado del token
  const renderContent = () => {
    if (isLoading && tokenStatus === 'verifying') {
      return (
        <div className="verification-loading">
          <div className="spinner"></div>
          <p>{message}</p>
        </div>
      );
    }
    
    if (tokenStatus === 'invalid' || tokenStatus === 'expired') {
      return (
        <div className="verification-error">
          <div className="error-icon">✗</div>
          <h3>Enlace no válido</h3>
          <p>{message}</p>
          <div className="verification-actions">
            <Link to="/recuperar-password" className="verification-btn">
              Solicitar nuevo enlace
            </Link>
            <Link to="/login" className="verification-link">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      );
    }
    
    if (isSuccess) {
      return (
        <div className="verification-success">
          <div className="success-icon">✓</div>
          <h3>¡Contraseña actualizada!</h3>
          <p>{message}</p>
          <p>Redireccionando al inicio de sesión...</p>
        </div>
      );
    }
    
    // Token válido, mostrar formulario
    return (
      <>
        <p className="auth-subtitle">Crea tu nueva contraseña</p>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <span className="icon emoji-icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
              required
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          
          <div className="input-container">
            <span className="icon emoji-icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="verification-btn"
            disabled={isLoading}
          >
            {isLoading ? "Actualizando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      </>
    );
  };
  
  return (
    <div className="old-auth-container">
      <div className="verification-box">
        <h2 className="titulo">Restablecer Contraseña</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default ResetPassword;