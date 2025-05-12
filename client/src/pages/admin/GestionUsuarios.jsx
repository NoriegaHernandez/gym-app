// client/src/pages/admin/GestionUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../cliente/Dashboard.css'; // Usamos el mismo CSS del cliente
import './UserManagementStyles.css'; // Estilos específicos para gestión de usuarios

const GestionUsuarios = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'delete', 'view', 'membership'
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'cliente', 'coach', 'administrador'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'activo', 'pendiente', 'inactivo'
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
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
  
  // Estados para la gestión de membresías
  const [membershipHistory, setMembershipHistory] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [newMembership, setNewMembership] = useState({
    id_plan: '',
    tipo_plan: 'mensual',
    fecha_inicio: new Date().toISOString().split('T')[0],
    precio_pagado: '',
    metodo_pago: 'Efectivo'
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
  
  // Tipos de plan para membresías
  const planTypes = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'trimestral', label: 'Trimestral (10% desc.)' },
    { value: 'anual', label: 'Anual (15% desc.)' }
  ];
  
  // Métodos de pago
  const paymentMethods = [
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
    { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
    { value: 'Transferencia', label: 'Transferencia' }
  ];

  // Opciones de filas por página
  const rowsPerPageOptions = [5, 10, 25, 50];

  // Verificar autenticación
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Cargar usuarios con información de membresías
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        try {
          const response = await api.getUsersWithMemberships();
          setUsers(response || []);
          setFilteredUsers(response || []);
        } catch (membershipError) {
          console.error('Error al obtener usuarios con membresías:', membershipError);
          const response = await api.getUsers();
          setUsers(response.data || []);
          setFilteredUsers(response.data || []);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setError('Error al cargar la lista de usuarios');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Cargar planes disponibles
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await api.getAvailablePlans();
        setAvailablePlans(plans);
        
        if (plans.length > 0) {
          setNewMembership(prev => ({
            ...prev,
            id_plan: plans[0].id_plan,
            precio_pagado: plans[0].precio
          }));
        }
      } catch (error) {
        console.error('Error al cargar planes:', error);
      }
    };
    
    fetchPlans();
  }, []);
  
  // Filtrar usuarios
  useEffect(() => {
    let result = [...users];
    
    if (filterType !== 'all') {
      result = result.filter(user => user.tipo_usuario === filterType);
    }
    
    if (filterStatus !== 'all') {
      result = result.filter(user => user.estado_usuario || user.estado === filterStatus);
    }
    
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.nombre.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        (user.telefono && user.telefono.toLowerCase().includes(searchTermLower))
      );
    }
    
    setFilteredUsers(result);
    setCurrentPage(1); // Resetear a la primera página cuando se filtra
    setTotalPages(Math.ceil(result.length / rowsPerPage));
  }, [users, searchTerm, filterType, filterStatus, rowsPerPage]);

  // Calcular usuarios paginados
  const getPaginatedUsers = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  // Calcular el rango de páginas a mostrar
  const getPageNumbers = () => {
    const totalNumbers = 5; // Total de números de página a mostrar
    const totalBlocks = totalNumbers + 2; // Incluyendo los bloques de primera y última página
    
    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      let pages = ['1']; // Siempre mostrar la primera página
      
      if (startPage > 2) {
        pages.push('...'); // Mostrar puntos suspensivos
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i.toString());
      }
      
      if (endPage < totalPages - 1) {
        pages.push('...'); // Mostrar puntos suspensivos
      }
      
      pages.push(totalPages.toString()); // Siempre mostrar la última página
      
      return pages;
    }
    
    return Array.from({ length: totalPages }, (_, i) => (i + 1).toString());
  };

  // Manejar cambio de página
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Manejar cambio de filas por página
  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Resetear a la primera página
    setTotalPages(Math.ceil(filteredUsers.length / newRowsPerPage));
  };

  // Manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión. Por favor intente nuevamente.');
    }
  };

  // Todos los manejadores de modal y funciones auxiliares...
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

  const handleOpenEditModal = (user) => {
    setFormData({
      nombre: user.nombre || '',
      email: user.email || '',
      password: '',
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      fecha_nacimiento: user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toISOString().split('T')[0] : '',
      tipo_usuario: user.tipo_usuario || 'cliente',
      estado: user.estado_usuario || user.estado || 'activo'
    });
    setSelectedUser(user);
    setModalType('edit');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setModalType('view');
    setShowModal(true);
  };

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    setModalType('delete');
    setShowModal(true);
    setError('');
    setSuccess('');
  };
  
  const handleOpenMembershipModal = async (user) => {
    setSelectedUser(user);
    setModalType('membership');
    setShowModal(true);
    setError('');
    setSuccess('');
    
    try {
      const history = await api.getUserMembershipHistory(user.id_usuario);
      setMembershipHistory(history);
      
      const defaultPlan = availablePlans.length > 0 ? availablePlans[0].id_plan : '';
      const defaultPrice = availablePlans.length > 0 ? availablePlans[0].precio : '';
      
      setNewMembership({
        id_plan: defaultPlan,
        tipo_plan: 'mensual',
        fecha_inicio: new Date().toISOString().split('T')[0],
        precio_pagado: defaultPrice,
        metodo_pago: 'Efectivo'
      });
    } catch (error) {
      console.error('Error al cargar datos de membresía:', error);
      setError('Error al cargar el historial de membresías');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleMembershipFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'id_plan') {
      const selectedPlan = availablePlans.find(plan => plan.id_plan === parseInt(value));
      if (selectedPlan) {
        let precio = selectedPlan.precio;
        
        if (newMembership.tipo_plan === 'trimestral') {
          precio = precio * 3 * 0.9;
        } else if (newMembership.tipo_plan === 'anual') {
          precio = precio * 12 * 0.85;
        }
        
        setNewMembership({
          ...newMembership,
          [name]: value,
          precio_pagado: precio.toFixed(2)
        });
      } else {
        setNewMembership({
          ...newMembership,
          [name]: value
        });
      }
    } else if (name === 'tipo_plan') {
      if (newMembership.id_plan) {
        const selectedPlan = availablePlans.find(plan => plan.id_plan === parseInt(newMembership.id_plan));
        if (selectedPlan) {
          let precio = selectedPlan.precio;
          
          if (value === 'mensual') {
            // Precio base mensual
          } else if (value === 'trimestral') {
            precio = precio * 3 * 0.9;
          } else if (value === 'anual') {
            precio = precio * 12 * 0.85;
          }
          
          setNewMembership({
            ...newMembership,
            [name]: value,
            precio_pagado: precio.toFixed(2)
          });
        } else {
          setNewMembership({
            ...newMembership,
            [name]: value
          });
        }
      } else {
        setNewMembership({
          ...newMembership,
          [name]: value
        });
      }
    } else {
      setNewMembership({
        ...newMembership,
        [name]: value
      });
    }
  };

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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El formato del email no es válido');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (formData.tipo_usuario === 'coach' && modalType === 'create') {
        if (!formData.especialidad) {
          formData.especialidad = 'General';
        }
      }
      
      if (modalType === 'create') {
        await api.createUser(formData);
        setSuccess('Usuario creado exitosamente');
      } else if (modalType === 'edit') {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.updateUser(selectedUser.id_usuario, updateData);
        setSuccess('Usuario actualizado exitosamente');
      }
      
      try {
        const response = await api.getUsersWithMemberships();
        setUsers(response || []);
      } catch (membershipError) {
        const response = await api.getUsers();
        setUsers(response.data || []);
      }
      
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

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      await api.deleteUser(selectedUser.id_usuario);
      setSuccess('Usuario eliminado exitosamente');
      
      try {
        const response = await api.getUsersWithMemberships();
        setUsers(response || []);
      } catch (membershipError) {
        const response = await api.getUsers();
        setUsers(response.data || []);
      }
      
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
  
  const handleCreateMembership = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !newMembership.id_plan || !newMembership.tipo_plan) {
      setError('Faltan datos obligatorios para la membresía');
      return;
    }
    
    try {
      setLoading(true);
      
      let duracion_dias;
      const selectedPlan = availablePlans.find(plan => plan.id_plan === parseInt(newMembership.id_plan));
      
      if (newMembership.tipo_plan === 'mensual') {
        duracion_dias = 30;
      } else if (newMembership.tipo_plan === 'trimestral') {
        duracion_dias = 90;
      } else if (newMembership.tipo_plan === 'anual') {
        duracion_dias = 365;
      }
      
      const membershipData = {
        id_usuario: selectedUser.id_usuario,
        id_plan: parseInt(newMembership.id_plan),
        tipo_plan: newMembership.tipo_plan,
        fecha_inicio: newMembership.fecha_inicio,
        duracion_dias: duracion_dias,
        precio_pagado: parseFloat(newMembership.precio_pagado),
        metodo_pago: newMembership.metodo_pago
      };
      
      await api.createMembership(membershipData);
      
      const history = await api.getUserMembershipHistory(selectedUser.id_usuario);
      setMembershipHistory(history);
      
      try {
        const response = await api.getUsersWithMemberships();
        setUsers(response || []);
      } catch (membershipError) {
        const response = await api.getUsers();
        setUsers(response.data || []);
      }
      
      setSuccess('Membresía creada exitosamente');
      setLoading(false);
    } catch (error) {
      console.error('Error al crear membresía:', error);
      setError(error.response?.data?.message || 'Error al crear la membresía');
      setLoading(false);
    }
  };
  
  const handleCancelMembership = async (membershipId) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta membresía?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await api.cancelMembership(membershipId);
      
      const history = await api.getUserMembershipHistory(selectedUser.id_usuario);
      setMembershipHistory(history);
      
      try {
        const response = await api.getUsersWithMemberships();
        setUsers(response || []);
      } catch (membershipError) {
        const response = await api.getUsers();
        setUsers(response.data || []);
      }
      
      setSuccess('Membresía cancelada exitosamente');
      setLoading(false);
    } catch (error) {
      console.error('Error al cancelar membresía:', error);
      setError(error.response?.data?.message || 'Error al cancelar la membresía');
      setLoading(false);
    }
  };
  
  const handleRenewMembership = async () => {
    if (!selectedUser || !newMembership.id_plan || !newMembership.tipo_plan) {
      setError('Faltan datos obligatorios para renovar la membresía');
      return;
    }
    
    const activeMembership = membershipHistory.find(m => m.estado === 'activa');
    if (!activeMembership) {
      setError('No hay una membresía activa para renovar');
      return;
    }
    
    try {
      setLoading(true);
      
      let duracion_dias;
      if (newMembership.tipo_plan === 'mensual') {
        duracion_dias = 30;
      } else if (newMembership.tipo_plan === 'trimestral') {
        duracion_dias = 90;
      } else if (newMembership.tipo_plan === 'anual') {
        duracion_dias = 365;
      }
      
      const membershipData = {
        id_plan: parseInt(newMembership.id_plan),
        tipo_plan: newMembership.tipo_plan,
        fecha_inicio: new Date().toISOString().split('T')[0],
        duracion_dias: duracion_dias,
        precio_pagado: parseFloat(newMembership.precio_pagado),
        metodo_pago: newMembership.metodo_pago
      };
      
      await api.renewMembership(activeMembership.id_suscripcion, membershipData);
      
      const history = await api.getUserMembershipHistory(selectedUser.id_usuario);
      setMembershipHistory(history);
      
      try {
        const response = await api.getUsersWithMemberships();
        setUsers(response || []);
      } catch (membershipError) {
        const response = await api.getUsers();
        setUsers(response.data || []);
      }
      
      setSuccess('Membresía renovada exitosamente');
      setLoading(false);
    } catch (error) {
      console.error('Error al renovar membresía:', error);
      setError(error.response?.data?.message || 'Error al renovar la membresía');
      setLoading(false);
    }
  };

  // Funciones auxiliares de renderizado
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
  
  const renderMembershipStatus = (user) => {
    if (!user.estado_membresia && !user.id_suscripcion) {
      return (
        <span className="membership-badge inactive">
          Sin membresía
        </span>
      );
    }
    
    if (user.estado_membresia) {
      if (user.estado_membresia === 'activa') {
        return (
          <div className="membership-info">
            <span className="membership-badge active">Activa</span>
            <span className="membership-detail">
              {user.nombre_plan || 'Plan'} - Vence: {formatDate(user.fecha_fin)}
            </span>
          </div>
        );
      } else {
        return (
          <span className="membership-badge inactive">
            {user.estado_membresia === 'vencida' ? 'Vencida' : 
             user.estado_membresia === 'cancelada' ? 'Cancelada' : 
             'Inactiva'}
          </span>
        );
      }
    }
    
    return (
      <button 
        className="action-button membership-mini"
        onClick={() => handleOpenMembershipModal(user)}
        title="Gestionar membresía"
      >
        Gestionar
      </button>
    );
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
          <button className="menu-button" onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
          <button className="menu-button" onClick={() => navigate('/admin/coaches')}>Gestión de Coaches</button>
          <button className="menu-button active">Gestión de Usuarios</button>
          <button className="menu-button" onClick={() => navigate('/admin/membresias')}>Membresías</button>
          <button className="menu-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="content-wrapper">
          {/* Tarjeta de usuario */}
          <div className="user-card">
            <div className="user-avatar">
              <img src="/src/assets/icons/admin.png" alt="Admin Avatar" width="50" height="50" />
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'Administrador'}</div>
              <div className="membership-details">
                <span>Administrador del Sistema</span>
                <span>Gestión de Usuarios</span>
              </div>
            </div>
          </div>
          
          {/* Título de la página */}
          <h1 className="page-title">Gestión de Usuarios</h1>
          
          {/* Mensajes de error y éxito */}
          {error && !showModal && (
            <div className="error-message">
              {error}
              <button className="error-close" onClick={() => setError(null)}>×</button>
            </div>
          )}
          {success && !showModal && (
            <div className="success-message">
              {success}
              <button className="success-close" onClick={() => setSuccess(null)}>×</button>
            </div>
          )}
          
          {/* Contenedor principal de gestión de usuarios */}
          <div className="users-management-container">
            <div className="toolbar">
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
                className="primary-button"
                onClick={handleOpenCreateModal}
              >
                <span>➕</span> Nuevo Usuario
              </button>
            </div>
            
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
                    className="secondary-button"
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
              <div className="table-container">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Membresía</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedUsers().map(user => (
                        <tr key={user.id_usuario}>
                          <td>{user.id_usuario}</td>
                          <td>{user.nombre}</td>
                          <td>{user.email}</td>
                          <td>{user.telefono || 'N/A'}</td>
                          <td>{renderUserType(user.tipo_usuario)}</td>
                          <td>{renderStatus(user.estado_usuario || user.estado)}</td>
                          <td>{renderMembershipStatus(user)}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-button view"
                                onClick={() => handleOpenViewModal(user)}
                                title="Ver detalles"
                              >
                               👁️
                              </button>
                              <button 
                                className="action-button edit"
                                onClick={() => handleOpenEditModal(user)}
                                title="Editar usuario"
                              >✏️
                              </button>
                              <button 
                                className="action-button membership"
                                onClick={() => handleOpenMembershipModal(user)}
                                title="Gestionar membresía"
                              >
                               🧾
                              </button>
                              <button 
                                className="action-button delete"
                                onClick={() => handleOpenDeleteModal(user)}
                                title="Eliminar usuario"
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
                
                {/* Paginación */}
                <div className="pagination-container">
                  <div className="pagination-info">
                    Mostrando {((currentPage - 1) * rowsPerPage) + 1} a {Math.min(currentPage * rowsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
                  </div>
                  
                  <div className="pagination-controls">
                    <div className="page-size-selector">
                      <label>Filas por página:</label>
                      <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
                        {rowsPerPageOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button 
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </button>
                    
                    <div className="page-numbers">
                      {getPageNumbers().map((pageNumber, index) => {
                        if (pageNumber === '...') {
                          return <span key={index} className="ellipsis">...</span>;
                        }
                        
                        return (
                          <button
                            key={index}
                            className={`pagination-button ${currentPage === parseInt(pageNumber) ? 'active' : ''}`}
                            onClick={() => handlePageChange(parseInt(pageNumber))}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Los modales permanecen igual... */}
      {showModal && (
        <div className="modal-overlay">
          <div className={`modal-container ${modalType === 'view' || modalType === 'membership' ? 'large' : ''}`}>
            <div className="modal-header">
              <h2>
                {modalType === 'create' && 'Crear Nuevo Usuario'}
                {modalType === 'edit' && 'Editar Usuario'}
                {modalType === 'view' && 'Detalles del Usuario'}
                {modalType === 'delete' && 'Eliminar Usuario'}
                {modalType === 'membership' && 'Gestión de Membresía'}
              </h2>
              <button className="modal-close-button" onClick={handleCloseModal}>&times;</button>
            </div>
            
            {/* El contenido de los modales permanece igual... */}
            <div className="modal-content">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              
              {/* Formulario para crear o editar usuario */}
              {(modalType === 'create' || modalType === 'edit') && (
                <form onSubmit={handleSubmit} className="user-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nombre completo</label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ingrese nombre completo"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ingrese email"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Contraseña {modalType === 'edit' && '(Dejar en blanco para mantenerla)'}</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={modalType === 'create' ? "Ingrese contraseña" : "Dejar en blanco para mantener"}
                        required={modalType === 'create'}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Ingrese teléfono"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Fecha de nacimiento</label>
                      <input
                        type="date"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Dirección</label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder="Ingrese dirección"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Tipo de usuario</label>
                      <select
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
                      <label>Estado</label>
                      <select
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
                  
                  {/* Campos adicionales para entrenadores */}
                  {formData.tipo_usuario === 'coach' && (
                    <div className="form-group full-width">
                      <label>Especialidad</label>
                      <input
                        type="text"
                        name="especialidad"
                        value={formData.especialidad || ''}
                        onChange={handleChange}
                        placeholder="Especialidad del entrenador"
                      />
                    </div>
                  )}
                  
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="secondary-button"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="primary-button"
                      disabled={loading}
                    >
                      {loading ? 'Guardando...' : modalType === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'}
                    </button>
                  </div>
                </form>
              )}
              
              {/* Ver detalles del usuario */}
              {modalType === 'view' && selectedUser && (
                <div className="user-details">
                  <div className="user-avatar-large">
                    <div className="avatar-placeholder">
                      {selectedUser.nombre.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="user-info-header">
                    <h3>{selectedUser.nombre}</h3>
                    <p>{selectedUser.email}</p>
                    <div className="user-badges">
                      {renderUserType(selectedUser.tipo_usuario)}
                      {renderStatus(selectedUser.estado_usuario || selectedUser.estado)}
                    </div>
                  </div>
                  
                  <div className="info-grid">
                    <div className="info-item">
                     <label>ID:</label>
                      <span>{selectedUser.id_usuario}</span>
                    </div>
                    
                    <div className="info-item">
                      <label>Teléfono:</label>
                      <span>{selectedUser.telefono || 'No registrado'}</span>
                    </div>
                    
                    <div className="info-item">
                      <label>Fecha de Nacimiento:</label>
                      <span>{selectedUser.fecha_nacimiento ? formatDate(selectedUser.fecha_nacimiento) : 'No registrada'}</span>
                    </div>
                    
                    <div className="info-item">
                      <label>Dirección:</label>
                      <span>{selectedUser.direccion || 'No registrada'}</span>
                    </div>
                    
                    <div className="info-item">
                      <label>Fecha de Registro:</label>
                      <span>{selectedUser.fecha_registro ? formatDate(selectedUser.fecha_registro) : 'No disponible'}</span>
                    </div>
                    
                    <div className="info-item">
                      <label>Último Acceso:</label>
                      <span>{selectedUser.ultimo_acceso ? formatDate(selectedUser.ultimo_acceso) : 'No disponible'}</span>
                    </div>
                  </div>
                  
                  {selectedUser.tipo_usuario === 'coach' && (
                    <div className="coach-details">
                      <h4>Información de Entrenador</h4>
                      <div className="info-item">
                        <label>Especialidad:</label>
                        <span>{selectedUser.especialidad || 'General'}</span>
                      </div>
                      <div className="info-item">
                        <label>Clientes Asignados:</label>
                        <span>{selectedUser.clientes_asignados || 0}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="membership-details-section">
                    <h4>Información de Membresía</h4>
                    {(selectedUser.id_suscripcion && selectedUser.estado_membresia === 'activa') ? (
                      <div className="active-membership">
                        <div className="membership-header">
                          <span className="membership-badge active">Activa</span>
                          <h5>{selectedUser.nombre_plan}</h5>
                        </div>
                        
                        <div className="info-grid">
                          <div className="info-item">
                            <label>Tipo de Plan:</label>
                            <span>{selectedUser.tipo_plan || 'Mensual'}</span>
                          </div>
                          <div className="info-item">
                            <label>Inicio:</label>
                            <span>{formatDate(selectedUser.fecha_inicio)}</span>
                          </div>
                          <div className="info-item">
                            <label>Vencimiento:</label>
                            <span>{formatDate(selectedUser.fecha_fin)}</span>
                          </div>
                          <div className="info-item">
                            <label>Último Pago:</label>
                            <span>${selectedUser.precio_pagado || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <button
                          className="action-button membership"
                          onClick={() => handleOpenMembershipModal(selectedUser)}
                        >
                          Gestionar Membresía
                        </button>
                      </div>
                    ) : (
                      <div className="no-membership">
                        <p>Este usuario no tiene una membresía activa.</p>
                        <button
                          className="action-button membership"
                          onClick={() => handleOpenMembershipModal(selectedUser)}
                        >
                          Crear Membresía
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="secondary-button"
                      onClick={handleCloseModal}
                    >
                      Cerrar
                    </button>
                    <button 
                      type="button" 
                      className="primary-button"
                      onClick={() => {
                        handleCloseModal();
                        handleOpenEditModal(selectedUser);
                      }}
                    >
                      Editar Usuario
                    </button>
                  </div>
                </div>
              )}
              
              {/* Eliminar usuario */}
              {modalType === 'delete' && selectedUser && (
                <div className="delete-confirmation">
                  <div className="warning-icon">⚠️</div>
                  <p>¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser.nombre}</strong>?</p>
                  <p className="warning-text">Esta acción no se puede deshacer y eliminará todos los datos asociados al usuario.</p>
                  
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="secondary-button"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      className="danger-button"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      {loading ? 'Eliminando...' : 'Eliminar Usuario'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Gestión de membresías */}
              {modalType === 'membership' && selectedUser && (
                <div className="membership-management">
                  <div className="user-info-header">
                    <h3>{selectedUser.nombre}</h3>
                    <p>{selectedUser.email}</p>
                    <div className="user-badges">
                      {renderUserType(selectedUser.tipo_usuario)}
                      {renderStatus(selectedUser.estado_usuario || selectedUser.estado)}
                    </div>
                  </div>
                  
                  <div className="membership-tabs">
                    <div className="membership-section">
                      <h4>Historial de Membresías</h4>
                      
                      {loading ? (
                        <div className="loading-container">
                          <div className="spinner"></div>
                          <p>Cargando datos...</p>
                        </div>
                      ) : membershipHistory.length === 0 ? (
                        <div className="empty-state small">
                          <p>No hay registros de membresías para este usuario.</p>
                        </div>
                      ) : (
                        <div className="history-list">
                          {membershipHistory.map((membership, index) => (
                            <div key={index} className={`history-item ${membership.estado === 'activa' ? 'active' : ''}`}>
                              <div className="history-header">
                                <h5>{membership.nombre_plan}</h5>
                                <span className={`membership-badge ${membership.estado === 'activa' ? 'active' : 'inactive'}`}>
                                  {membership.estado === 'activa' ? 'Activa' : 
                                   membership.estado === 'vencida' ? 'Vencida' : 
                                   membership.estado === 'cancelada' ? 'Cancelada' : 
                                   'Inactiva'}
                                </span>
                              </div>
                              
                              <div className="history-details">
                                <div className="history-detail">
                                  <label>Tipo:</label>
                                  <span>{membership.tipo_plan || 'Mensual'}</span>
                                </div>
                                <div className="history-detail">
                                  <label>Inicio:</label>
                                  <span>{formatDate(membership.fecha_inicio)}</span>
                                </div>
                                <div className="history-detail">
                                  <label>Fin:</label>
                                  <span>{formatDate(membership.fecha_fin)}</span>
                                </div>
                                <div className="history-detail">
                                  <label>Precio:</label>
                                  <span>${membership.precio_pagado}</span>
                                </div>
                                <div className="history-detail">
                                  <label>Pago:</label>
                                  <span>{membership.metodo_pago}</span>
                                </div>
                              </div>
                              
                              {membership.estado === 'activa' && (
                                <div className="history-actions">
                                  <button 
                                    className="danger-button small"
                                    onClick={() => handleCancelMembership(membership.id_suscripcion)}
                                  >
                                    Cancelar Membresía
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="membership-section">
                      <h4>{membershipHistory.some(m => m.estado === 'activa') ? 'Renovar Membresía' : 'Nueva Membresía'}</h4>
                      
                      <form className="membership-form">
                        <div className="form-group">
                          <label>Plan</label>
                          <select
                            name="id_plan"
                            value={newMembership.id_plan}
                            onChange={handleMembershipFormChange}
                            required
                          >
                            {availablePlans.map(plan => (
                              <option key={plan.id_plan} value={plan.id_plan}>
                                {plan.nombre} - ${plan.precio}/mes
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label>Tipo de Plan</label>
                          <select
                            name="tipo_plan"
                            value={newMembership.tipo_plan}
                            onChange={handleMembershipFormChange}
                            required
                          >
                            {planTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label>Fecha de Inicio</label>
                          <input
                            type="date"
                            name="fecha_inicio"
                            value={newMembership.fecha_inicio}
                            onChange={handleMembershipFormChange}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Precio a Pagar</label>
                          <input
                            type="number"
                            name="precio_pagado"
                            value={newMembership.precio_pagado}
                            onChange={handleMembershipFormChange}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Método de Pago</label>
                          <select
                            name="metodo_pago"
                            value={newMembership.metodo_pago}
                            onChange={handleMembershipFormChange}
                            required
                          >
                            {paymentMethods.map(method => (
                              <option key={method.value} value={method.value}>{method.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        {membershipHistory.some(m => m.estado === 'activa') ? (
                          <button 
                            type="button" 
                            className="primary-button"
                            onClick={handleRenewMembership}
                            disabled={loading}
                          >
                            {loading ? 'Procesando...' : 'Renovar Membresía'}
                          </button>
                        ) : (
                          <button 
                            type="button" 
                            className="primary-button"
                            onClick={handleCreateMembership}
                            disabled={loading}
                          >
                            {loading ? 'Procesando...' : 'Crear Membresía'}
                          </button>
                        )}
                      </form>
                    </div>
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="secondary-button"
                      onClick={handleCloseModal}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;