
// export default GestionUsuarios;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminStyles.css';
import './UserManagementStyles.css';

const GestionUsuarios = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'delete', 'view'
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'cliente', 'coach', 'administrador'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'activo', 'pendiente', 'inactivo'
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    tipo_usuario: 'cliente',
    estado: 'activo'
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Tipos de usuario para el dropdown
  const userTypes = [
    { value: 'cliente', label: 'Cliente' },
    { value: 'coach', label: 'Entrenador' },
    { value: 'administrador', label: 'Administrador' }
  ];
  
  // Estados de usuario para el dropdown
  const userStatuses = [
    { value: 'activo', label: 'Activo' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'suspendido', label: 'Suspendido' }
  ];

  // Verificar autenticación
  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.getUsers();
        setUsers(response.data || []);
        setFilteredUsers(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setError('Error al cargar la lista de usuarios');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filtrar usuarios
  useEffect(() => {
    let result = [...users];
    
    // Filtrar por tipo de usuario
    if (filterType !== 'all') {
      result = result.filter(user => user.tipo_usuario === filterType);
    }
    
    // Filtrar por estado
    if (filterStatus !== 'all') {
      result = result.filter(user => user.estado === filterStatus);
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.nombre.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        (user.telefono && user.telefono.toLowerCase().includes(searchTermLower))
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, filterType, filterStatus]);

  // Manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await logout();
      // Redireccionar a la página de inicio de sesión después de cerrar sesión
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Mostrar algún mensaje de error al usuario si es necesario
      setError('Error al cerrar sesión. Por favor intente nuevamente.');
    }
  };

  // Abrir modal para crear usuario
  const handleOpenCreateModal = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      direccion: '',
      fecha_nacimiento: '',
      tipo_usuario: 'cliente',
      estado: 'activo'
    });
    setModalType('create');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  // Abrir modal para editar usuario
  const handleOpenEditModal = (user) => {
    setFormData({
      nombre: user.nombre || '',
      email: user.email || '',
      password: '', // No mostrar contraseña por seguridad
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      fecha_nacimiento: user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toISOString().split('T')[0] : '',
      tipo_usuario: user.tipo_usuario || 'cliente',
      estado: user.estado || 'activo'
    });
    setSelectedUser(user);
    setModalType('edit');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  // Abrir modal para ver detalles
  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setModalType('view');
    setShowModal(true);
  };

  // Abrir modal para confirmar eliminación
  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    setModalType('delete');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.nombre) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!formData.email) {
      setError('El email es obligatorio');
      return false;
    }
    if (modalType === 'create' && !formData.password) {
      setError('La contraseña es obligatoria para nuevos usuarios');
      return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El formato del email no es válido');
      return false;
    }
    
    return true;
  };

  // Crear o actualizar usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Si es entrenador, verificar datos adicionales
      if (formData.tipo_usuario === 'coach' && modalType === 'create') {
        if (!formData.especialidad) {
          formData.especialidad = 'General'; // Valor por defecto
        }
      }
      
      if (modalType === 'create') {
        // Crear nuevo usuario
        await api.createUser(formData);
        setSuccess('Usuario creado exitosamente');
      } else if (modalType === 'edit') {
        // Actualizar usuario existente
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // No enviar contraseña si está vacía
        }
        await api.updateUser(selectedUser.id_usuario, updateData);
        setSuccess('Usuario actualizado exitosamente');
      }
      
      // Recargar la lista de usuarios
      const response = await api.getUsers();
      setUsers(response.data || []);
      
      // Cerrar el modal después de un breve tiempo
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 2000);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setError(error.response?.data?.message || 'Error al guardar los datos del usuario');
      setLoading(false);
    }
  };

  // Eliminar usuario
  const handleDelete = async () => {
    try {
      setLoading(true);
      
      await api.deleteUser(selectedUser.id_usuario);
      setSuccess('Usuario eliminado exitosamente');
      
      // Recargar la lista de usuarios
      const response = await api.getUsers();
      setUsers(response.data || []);
      
      // Cerrar el modal después de un breve tiempo
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 2000);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError(error.response?.data?.message || 'Error al eliminar el usuario');
      setLoading(false);
    }
  };

  // Función para renderizar el estado con badge
  const renderStatus = (status) => {
    let statusClass = '';
    let statusText = '';
    
    switch (status) {
      case 'activo':
        statusClass = 'status-active';
        statusText = 'Activo';
        break;
      case 'pendiente':
        statusClass = 'status-pending';
        statusText = 'Pendiente';
        break;
      case 'inactivo':
        statusClass = 'status-inactive';
        statusText = 'Inactivo';
        break;
      case 'suspendido':
        statusClass = 'status-suspended';
        statusText = 'Suspendido';
        break;
      default:
        statusClass = 'status-unknown';
        statusText = status || 'Desconocido';
    }
    
    return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
  };

  // Función para renderizar el tipo de usuario
  const renderUserType = (type) => {
    let typeClass = '';
    let typeText = '';
    
    switch (type) {
      case 'cliente':
        typeClass = 'type-client';
        typeText = 'Cliente';
        break;
      case 'coach':
        typeClass = 'type-coach';
        typeText = 'Entrenador';
        break;
      case 'administrador':
        typeClass = 'type-admin';
        typeText = 'Administrador';
        break;
      default:
        typeClass = 'type-unknown';
        typeText = type || 'Desconocido';
    }
    
    return <span className={`type-badge ${typeClass}`}>{typeText}</span>;
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>FitnessGym</h2>
        </div>
        <nav className="admin-nav">
          <button className="admin-nav-button" onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
          <button className="admin-nav-button" onClick={() => navigate('/admin/coaches')}>Gestión de Coaches</button>
          <button className="admin-nav-button active">Gestión de Usuarios</button>
          <button className="admin-nav-button" onClick={() => navigate('/admin/membresias')}>Membresías</button>
          <button className="admin-nav-button" onClick={handleLogout}>Cerrar sesión</button>
        </nav>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Gestión de Usuarios</h1>
          <div className="admin-profile">
            <span>{user?.name || 'Administrador'}</span>
          </div>
        </div>
        
        {error && <div className="admin-alert admin-error">{error}</div>}
        {success && <div className="admin-alert admin-success">{success}</div>}
        
        <div className="admin-toolbar">
          <div className="search-filter-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-container">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los tipos</option>
                {userTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los estados</option>
                {userStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            className="admin-primary-button"
            onClick={handleOpenCreateModal}
          >
            <i className="fas fa-plus"></i> Nuevo Usuario
          </button>
        </div>
        
        <div className="user-management-container">
          {loading && !showModal ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No se encontraron usuarios</h3>
              <p>No hay usuarios que coincidan con tus criterios de búsqueda o filtros.</p>
              {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
                <button 
                  className="admin-secondary-button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setFilterStatus('all');
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="user-table-responsive">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Fecha Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id_usuario}>
                      <td>{user.id_usuario}</td>
                      <td>{user.nombre}</td>
                      <td>{user.email}</td>
                      <td>{user.telefono || '-'}</td>
                      <td>{renderUserType(user.tipo_usuario)}</td>
                      <td>{renderStatus(user.estado)}</td>
                      <td>{user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button view"
                            title="Ver detalles"
                            onClick={() => handleOpenViewModal(user)}
                          >
                            👁️
                          </button>
                          <button 
                            className="action-button edit"
                            title="Editar usuario"
                            onClick={() => handleOpenEditModal(user)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-button delete"
                            title="Eliminar usuario"
                            onClick={() => handleOpenDeleteModal(user)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Modal para crear/editar/ver/eliminar usuario */}
        {showModal && (
          <div className="modal-overlay">
            <div className={`modal-container ${modalType === 'view' ? 'view-modal' : ''}`}>
              <div className="modal-header">
                <h2>
                  {modalType === 'create' && 'Nuevo Usuario'}
                  {modalType === 'edit' && 'Editar Usuario'}
                  {modalType === 'view' && 'Detalles del Usuario'}
                  {modalType === 'delete' && 'Eliminar Usuario'}
                </h2>
                <button 
                  className="modal-close-button"
                  onClick={handleCloseModal}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                {error && <div className="admin-alert admin-error">{error}</div>}
                {success && <div className="admin-alert admin-success">{success}</div>}
                
                {modalType === 'delete' ? (
                  <div className="delete-confirmation">
                    <div className="delete-icon">⚠️</div>
                    <p>¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser?.nombre}</strong>?</p>
                    <p>Esta acción no se puede deshacer.</p>
                    
                    <div className="modal-actions">
                      <button 
                        className="admin-secondary-button"
                        onClick={handleCloseModal}
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button 
                        className="admin-danger-button"
                        onClick={handleDelete}
                        disabled={loading}
                      >
                        {loading ? 'Eliminando...' : 'Eliminar Usuario'}
                      </button>
                    </div>
                  </div>
                ) : modalType === 'view' ? (
                  <div className="user-details">
                    <div className="user-avatar">
                      <div className="avatar-placeholder">
                        {selectedUser?.nombre?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    
                    <div className="user-info-grid">
                      <div className="user-info-item">
                        <label>ID:</label>
                        <span>{selectedUser?.id_usuario}</span>
                      </div>
                      <div className="user-info-item">
                        <label>Nombre:</label>
                        <span>{selectedUser?.nombre}</span>
                      </div>
                      <div className="user-info-item">
                        <label>Email:</label>
                        <span>{selectedUser?.email}</span>
                      </div>
                      <div className="user-info-item">
                        <label>Teléfono:</label>
                        <span>{selectedUser?.telefono || 'No especificado'}</span>
                      </div>
                      <div className="user-info-item">
                        <label>Dirección:</label>
                        <span>{selectedUser?.direccion || 'No especificada'}</span>
                      </div>
                      <div className="user-info-item">
                        <label>Fecha de Nacimiento:</label>
                        <span>
                          {selectedUser?.fecha_nacimiento 
                            ? new Date(selectedUser.fecha_nacimiento).toLocaleDateString() 
                            : 'No especificada'}
                        </span>
                      </div>
                      <div className="user-info-item">
                        <label>Tipo de Usuario:</label>
                        <span>{renderUserType(selectedUser?.tipo_usuario)}</span>
                      </div>
                      <div className="user-info-item">
                        <label>Estado:</label>
                        <span>{renderStatus(selectedUser?.estado)}</span>
                      </div>
                      <div className="user-info-item">
                        <label>Fecha de Registro:</label>
                        <span>
                          {selectedUser?.fecha_registro 
                            ? new Date(selectedUser.fecha_registro).toLocaleDateString() 
                            : 'No disponible'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="modal-actions">
                      <button 
                        className="admin-secondary-button"
                        onClick={handleCloseModal}
                      >
                        Cerrar
                      </button>
                      <button 
                        className="admin-primary-button"
                        onClick={() => {
                          handleCloseModal();
                          handleOpenEditModal(selectedUser);
                        }}
                      >
                        Editar Usuario
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="nombre">Nombre Completo*</label>
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
                        <label htmlFor="email">Email*</label>
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
                        <label htmlFor="password">
                          {modalType === 'create' 
                            ? 'Contraseña*' 
                            : 'Contraseña (dejar en blanco para mantener)'}
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required={modalType === 'create'}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="telefono">Teléfono</label>
                        <input
                          type="text"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="direccion">Dirección</label>
                        <input
                          type="text"
                          id="direccion"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          id="fecha_nacimiento"
                          name="fecha_nacimiento"
                          value={formData.fecha_nacimiento}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tipo_usuario">Tipo de Usuario*</label>
                        <select
                          id="tipo_usuario"
                          name="tipo_usuario"
                          value={formData.tipo_usuario}
                          onChange={handleChange}
                          required
                        >
                          {userTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="estado">Estado*</label>
                        <select
                          id="estado"
                          name="estado"
                          value={formData.estado}
                          onChange={handleChange}
                          required
                        >
                          {userStatuses.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {formData.tipo_usuario === 'coach' && (
                      <div className="coach-info-section">
                        <h3>Información de Entrenador</h3>
                        <p className="info-text">
                          Si el tipo de usuario es "Entrenador", también se creará un registro en la tabla de coaches.
                          Podrás completar la información específica de entrenador en la sección de Gestión de Coaches.
                        </p>
                      </div>
                    )}
                    
                    <div className="modal-actions">
                      <button 
                        type="button" 
                        className="admin-secondary-button"
                        onClick={handleCloseModal}
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="admin-primary-button"
                        disabled={loading}
                      >
                        {loading 
                          ? (modalType === 'create' ? 'Creando...' : 'Actualizando...') 
                          : (modalType === 'create' ? 'Crear Usuario' : 'Actualizar Usuario')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionUsuarios;