
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './PerfilUsuarioStyles.css';

const PerfilUsuario = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el modo de edición
  const [isEditing, setIsEditing] = useState(false);
  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: ''
  });
  // Estado para mensajes de éxito o error en la edición
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
  // Estado para el proceso de guardado
  const [isSaving, setSaving] = useState(false);
  
  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Verificar si hay token en localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay token de autenticación');
          setError('No se ha iniciado sesión');
          setLoading(false);
          return;
        }
        
        // Ver datos básicos desde el contexto de autenticación
        if (user) {
          console.log('Información básica del usuario desde AuthContext:', user);
        }
        
        // Intentar obtener datos más completos del usuario
        console.log('Intentando cargar datos del usuario...');
        try {
          const response = await api.getCurrentUser();
          console.log('Respuesta del servidor:', response);
          
          if (response) {
            setUserData(response);
            // Inicializar el formulario con los datos actuales
            setFormData({
              nombre: response.nombre || '',
              email: response.email || '',
              telefono: response.telefono || '',
              direccion: response.direccion || '',
              fecha_nacimiento: response.fecha_nacimiento ? response.fecha_nacimiento.split('T')[0] : ''
            });
          } else {
            throw new Error('No se recibieron datos del usuario');
          }
        } catch (apiError) {
          console.error('Error en la API:', apiError);
          
          // Si falla, usar los datos del contexto como fallback
          if (user) {
            console.log('Usando datos del contexto como alternativa');
            const fallbackData = {
              id_usuario: user.id,
              nombre: user.name || user.nombre || 'Usuario',
              email: user.email || '',
              tipo_usuario: user.type || user.tipo_usuario || 'cliente',
              estado: user.estado || 'activo'
            };
            setUserData(fallbackData);
            setFormData({
              nombre: fallbackData.nombre || '',
              email: fallbackData.email || '',
              telefono: '',
              direccion: '',
              fecha_nacimiento: ''
            });
          } else {
            throw new Error('No se pudieron obtener datos del usuario');
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setError('No se pudieron cargar los datos del perfil. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  // Manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  // Manejar el retorno a la página anterior
  const handleGoBack = () => {
    navigate(-1); // Vuelve a la página anterior
  };
  
  // Reintentar cargar los datos
  const handleRetry = () => {
    window.location.reload();
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setUpdateMessage({ type: '', text: '' });
      
      // Crear un objeto con solo los campos que necesitamos actualizar
      const updateData = {
        id_usuario: userData.id_usuario, // Asegúrate de incluir el ID
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono || null,
        direccion: formData.direccion || null,
        fecha_nacimiento: formData.fecha_nacimiento || null
      };
      
      console.log('Enviando datos actualizados:', updateData);
      
      // Realizar la solicitud fetch directa
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(updateData)
      });
      
      // Verificar la respuesta
      if (response.ok) {
        const data = await response.json();
        console.log('Perfil actualizado correctamente:', data);
        
        // Actualizar el estado local con los nuevos datos
        setUserData({
          ...userData,
          ...updateData
        });
        
        setUpdateMessage({ 
          type: 'success', 
          text: 'Perfil actualizado con éxito' 
        });
        
        // Salir del modo de edición
        setIsEditing(false);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo actualizar el perfil`);
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setUpdateMessage({ 
        type: 'error', 
        text: `Error: ${error.message}` 
      });
    } finally {
      setSaving(false);
    }
  };

  // Entrar en modo edición
  const handleEdit = () => {
    setIsEditing(true);
    setUpdateMessage({ type: '', text: '' });
    // Asegurarse de que formData tenga los valores actuales
    setFormData({
      nombre: userData.nombre || '',
      email: userData.email || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || '',
      fecha_nacimiento: userData.fecha_nacimiento ? userData.fecha_nacimiento.split('T')[0] : ''
    });
  };

  // Cancelar la edición
  const handleCancel = () => {
    setIsEditing(false);
    setUpdateMessage({ type: '', text: '' });
    // Restaurar el formulario con los datos actuales
    setFormData({
      nombre: userData.nombre || '',
      email: userData.email || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || '',
      fecha_nacimiento: userData.fecha_nacimiento ? userData.fecha_nacimiento.split('T')[0] : ''
    });
  };

  // Renderizado del componente
  return (
    <div className="perfil-container">
      <div className="perfil-sidebar">
        <div className="logo">
          <div className="logo-circle">
            <img src="/src/assets/icons/logo.png" alt="Logo Gimnasio" width="60" height="60" />
          </div>
          <h2>FitnessGym</h2>
        </div>
        
        <div className="nav-menu">
          <div className="nav-item" onClick={() => navigate('/cliente/dashboard')}>Inicio</div>
          <div className="nav-item" onClick={() => navigate('/cliente/informacion')}>Información</div>
          <div className="nav-item" onClick={() => navigate('/cliente/membresia')}>Membresía</div>
          <div className="nav-item" onClick={() => navigate('/cliente/entrenadores')}>Entrenadores</div>
          <div className="nav-item" onClick={handleLogout}>Cerrar sesión</div>
        </div>
      </div>
      
      <div className="perfil-content">
        <h1>Mi Perfil</h1>
        
        {/* Contenedor para los botones de navegación */}
        <div className="buttons-container">
          <button className="back-button" onClick={handleGoBack}>
            ← Regresar
          </button>
          
          {/* Botón editar (solo se muestra si hay datos de usuario y no está en modo edición) */}
          {userData && !isEditing && (
            <button className="edit-button-inline" onClick={handleEdit}>
              <span className="edit-icon">✏️</span> Editar Perfil
            </button>
          )}
        </div>
        
        {error ? (
          <div className="error-message">
            {error}
            <button className="retry-button" onClick={handleRetry}>
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando información del usuario...</p>
          </div>
        ) : userData ? (
          <div className="perfil-card">
            {/* Mensaje de actualización */}
            {updateMessage.text && (
              <div className={`update-message ${updateMessage.type}`}>
                {updateMessage.text}
              </div>
            )}
            
            {!isEditing ? (
              <>
                <div className="perfil-avatar">
                  <div className="avatar-placeholder">
                    {userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                
                <div className="perfil-info">
                  <h2>{userData.nombre || 'Usuario'}</h2>
                  <p className="email">{userData.email || ''}</p>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Teléfono:</span>
                      <span className="value">{userData.telefono || 'No especificado'}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Dirección:</span>
                      <span className="value">{userData.direccion || 'No especificada'}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Fecha de Nacimiento:</span>
                      <span className="value">
                        {userData.fecha_nacimiento 
                          ? new Date(userData.fecha_nacimiento).toLocaleDateString() 
                          : 'No especificada'}
                      </span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Fecha de Registro:</span>
                      <span className="value">
                        {userData.fecha_registro 
                          ? new Date(userData.fecha_registro).toLocaleDateString() 
                          : 'No disponible'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="edit-form-container">
                <h2>Editar Perfil</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono:</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="direccion">Dirección:</label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
                    <input
                      type="date"
                      id="fecha_nacimiento"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-buttons">
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="save-button"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay información disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilUsuario;