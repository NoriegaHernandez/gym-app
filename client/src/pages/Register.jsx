// client/src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const iconPaths = {
  usuario: '/src/assets/icons/usuario.png',
  apellido: '/src/assets/icons/usuario.png',
  contraseña: '/src/assets/icons/contra.png',
  correo: '/src/assets/icons/correo.png',
  telefono: '/src/assets/icons/telefono.png',
  contrato: '/src/assets/icons/contrato.png',
  direccion: '/src/assets/icons/direccion.png',
  fecha: '/src/assets/icons/fecha.png',
};

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    tipo_membresia: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('¡Cuenta creada con éxito! Redirigiendo...');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const { register, error } = useAuth();
  const navigate = useNavigate();

  // Función para combinar nombre y apellido
  const getFullName = () => {
    return `${formData.nombre} ${formData.apellido}`.trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      alert('Debe aceptar los términos y condiciones para continuar.');
      return;
    }
    
    try {
      // Reset any previous errors
      setLocalError(null);
      
      // Preparar los datos para el registro
      const userData = {
        nombre: getFullName(), // Combinar nombre y apellido
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        tipo_membresia: formData.tipo_membresia // Incluir tipo de membresía
      };
      
      // Mostrar mensaje de carga
      setIsLoading(true);
      
      // Registrar al usuario
      const result = await register(userData);
      
      // Verificar si se requiere verificación por email
      if (result && result.requiresVerification) {
        // Mostrar mensaje de verificación pendiente
        setShowSuccess(true);
        setSuccessMessage('¡Registro completado! Por favor, verifica tu correo electrónico para activar tu cuenta.');
        
        // Después de 3 segundos, redirigir a una página de confirmación
        setTimeout(() => {
          navigate('/registro-pendiente', { 
            state: { email: result.email } 
          });
        }, 3000);
      } else {
        // Si no se requiere verificación, seguir el flujo normal
        setShowSuccess(true);
        setSuccessMessage('¡Cuenta creada con éxito! Redirigiendo...');
        
        // Esperar 2 segundos y redirigir
        setTimeout(() => {
          navigate('/cliente/dashboard');
        }, 2000);
      }
    } catch (err) {
      setShowSuccess(false);
      // Mostrar el mensaje de error específico del servidor si está disponible
      const errorMessage = err.response?.data?.message || 'Error al registrar usuario. Por favor, intente más tarde.';
      console.error('Error en el formulario de registro:', err);
      // Establecer el mensaje de error para mostrarlo en la UI
      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para saber si el botón debe estar activo
  const isBtnActive = () => {
    return termsAccepted;
  };

  return (
    <div className="old-auth-container">
      <div className="registro-box">
        <h2 className="titulo">Registro</h2>
        
        {(error || localError) && (
          <div className="auth-error">
            {localError || error}
          </div>
        )}
        
        <form id="registroForm" onSubmit={handleSubmit}>
          <div className="input-container">
            <img className="icon" src={iconPaths.usuario} alt="Usuario" />
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
          </div>
          
          <div className="input-container">
            <img className="icon" src={iconPaths.usuario} alt="Usuario"/>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Apellido"
              required
            />
          </div>
          
          <div className="input-container">
            <img className="icon" src={iconPaths.contraseña} alt="Contraseña" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
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
            <img className="icon" src={iconPaths.correo} alt="Correo" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo"
              required
            />
          </div>
          
          <div className="input-container">
            <img className="icon" src={iconPaths.telefono} alt="Teléfono" />
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Núm. Celular"
              required
            />
          </div>
          
          <div className="input-container">
            <img className="icon" src={iconPaths.direccion} alt="Direccion"/>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Dirección"
            />
          </div>
          
          <div className="input-container">
            <img className="icon" src={iconPaths.fecha} alt="Fecha"/>
            <input
              type="date"
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              placeholder="Fecha de Nacimiento"
            />
          </div>
          
          <div className="input-container tipo-membresia">
            <img className="icon" src={iconPaths.contrato} alt="Contrato" />
            <div style={{ flexGrow: 1 }}>
              <select 
                id="tipo_membresia" 
                name="tipo_membresia"
                value={formData.tipo_membresia}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Tipo Membresía</option>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
            {formData.tipo_membresia && (
              <div className="membresia-pill">
                {formData.tipo_membresia.charAt(0).toUpperCase() + formData.tipo_membresia.slice(1)}
              </div>
            )}
          </div>
          
          <div className="terminos-container">
            <h3>Términos y Condiciones</h3>
            <p>Al crear una cuenta en el sitio web de moodfitnes, usted acepta los siguientes términos y condiciones:</p>
            <p>1. <strong>Registro de Usuario</strong> Para utilizar ciertos servicios, debe crear una cuenta proporcionando información veraz, actual y completa. Usted es responsable de mantener la confidencialidad de su contraseña y del uso de su cuenta.</p>
            <p>2. <strong>Uso del Sitio</strong> El sitio web y sus servicios están destinados exclusivamente a uso personal. Está prohibido cualquier uso fraudulento, abusivo o no autorizado del sitio.</p>
            <p>3. <strong>Privacidad de Datos</strong> La información personal proporcionada será tratada conforme a nuestra Política de Privacidad. No compartiremos sus datos sin su consentimiento, salvo por requerimiento legal.</p>
            <p>4. <strong>Modificaciones</strong> moodfitnes se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Le notificaremos sobre cambios importantes a través del correo registrado o en el sitio web.</p>
            <p>5. <strong>Suspensión o Cancelación de Cuenta</strong> Nos reservamos el derecho de suspender o cancelar su cuenta si incumple estos términos, sin previo aviso.</p>
            <p>6. <strong>Aceptación</strong> Al hacer clic en "Crear cuenta", usted reconoce haber leído, comprendido y aceptado estos Términos y Condiciones.</p>
          </div>
          
          <div className="checkbox-container">
            <input 
              type="checkbox" 
              id="aceptarTerminos"
              checked={termsAccepted}
              onChange={handleTermsChange}
            />
            <label htmlFor="aceptarTerminos">He leído y acepto los términos y condiciones</label>
          </div>
          
          <button 
            type="submit" 
            className={`crear-btn ${isBtnActive() ? 'active' : ''}`}
            disabled={!isBtnActive() || isLoading}
          >
            {isLoading ? "Registrando..." : "Crear Cuenta"}
          </button>
          
          <div className="auth-links">
            <p>
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
            </p>
          </div>
        </form>
      </div>
      
      {showSuccess && (
        <div id="mensajeExito">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Register;