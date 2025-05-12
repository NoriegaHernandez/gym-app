
// client/src/pages/cliente/Informacion.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css'; // Reutilizamos los estilos
import './Informacion.css'; // Estilos específicos para información

const Informacion = () => {
  const { user, logout } = useAuth();
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
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay token de autenticación');
          setError('No se ha iniciado sesión');
          setLoading(false);
          return;
        }
        
        console.log('Intentando cargar datos del usuario...');
        try {
          const response = await api.getCurrentUser();
          console.log('Respuesta del servidor:', response);
          
          if (response) {
            setUserData(response);
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
          
          if (user) {
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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
      
      const updateData = {
        id_usuario: userData.id_usuario,
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono || null,
        direccion: formData.direccion || null,
        fecha_nacimiento: formData.fecha_nacimiento || null
      };
      
      console.log('Enviando datos actualizados:', updateData);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Perfil actualizado correctamente:', data);
        
        setUserData({
          ...userData,
          ...updateData
        });
        
        setUpdateMessage({ 
          type: 'success', 
          text: 'Perfil actualizado con éxito' 
        });
        
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

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateMessage({ type: '', text: '' });
    setFormData({
      nombre: userData.nombre || '',
      email: userData.email || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || '',
      fecha_nacimiento: userData.fecha_nacimiento ? userData.fecha_nacimiento.split('T')[0] : ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdateMessage({ type: '', text: '' });
    setFormData({
      nombre: userData.nombre || '',
      email: userData.email || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || '',
      fecha_nacimiento: userData.fecha_nacimiento ? userData.fecha_nacimiento.split('T')[0] : ''
    });
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-circle">
            <img src="/logo.png" alt="Logo Gimnasio" className='logo-img' />
          </div>
        </div>
        
        <div className="menu-buttons">
          <button className="menu-button" onClick={() => navigate('/cliente/dashboard')}>Inicio</button>
          <button className="menu-button active">Información</button>
          <button className="menu-button" onClick={() => navigate('/cliente/membresia')}>Membresía</button>
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
              <span>Cliente del gimnasio</span>
              <span>Estado: Activo</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando información del usuario...</p>
          </div>
        ) : (
          <div className="profile-container">
            <h2>Mi Perfil</h2>
            
            {updateMessage.text && (
              <div className={`update-message ${updateMessage.type}`}>
                {updateMessage.text}
              </div>
            )}
            
            {!isEditing ? (
              <div className="profile-card">
                <div className="profile-header">
                  <h3>Información Personal</h3>
                  <button className="edit-button" onClick={handleEdit}>
                    <span className="edit-icon">✏️</span> Editar
                  </button>
                </div>
                
                <div className="profile-avatar">
                  <div className="avatar-placeholder">
                    {userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                
                <div className="profile-info">
                  <h3>{userData.nombre || 'Usuario'}</h3>
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
                    
                    <div className="info-item">
                      <span className="label">Tipo de Usuario:</span>
                      <span className="value">Cliente</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Estado:</span>
                      <span className="value">Activo</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-card edit-mode">
                <div className="profile-header">
                  <h3>Editar Información Personal</h3>
                </div>
                
                <div className="edit-form-container">
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
                        placeholder="Ej: 5551234567"
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
                        placeholder="Calle, número, colonia, ciudad"
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
              </div>
            )}
            
            <div className="information-section">
              <h3>Información adicional</h3>
              <p>Mantenemos tu información segura y protegida. Si necesitas actualizar algún dato adicional o tienes preguntas sobre tu cuenta, no dudes en contactarnos.</p>
              
              <div className="contact-info">
                <h4>¿Necesitas ayuda?</h4>
                <p>Puedes contactarnos en: <strong>(123) 456-7890</strong></p>
                <p>Email: <strong>soporte@fitnessgym.com</strong></p>
                <p>Horario de atención: Lunes a Viernes de 7:00 AM a 10:00 PM</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Informacion;
