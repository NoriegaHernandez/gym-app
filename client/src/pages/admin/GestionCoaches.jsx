// // client/src/pages/admin/GestionCoaches.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import './AdminStyles.css';
// import './UserManagementStyles.css';

// const GestionCoaches = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [coaches, setCoaches] = useState([]);
//   const [filteredCoaches, setFilteredCoaches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'delete', 'view'
//   const [selectedCoach, setSelectedCoach] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterSpecialty, setFilterSpecialty] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'activo', 'inactivo'
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [specialties, setSpecialties] = useState([
//     { value: 'General', label: 'General' },
//     { value: 'Musculación', label: 'Musculación' },
//     { value: 'Funcional', label: 'Funcional' },
//     { value: 'Cardio', label: 'Cardio' },
//     { value: 'Yoga', label: 'Yoga' },
//     { value: 'Pilates', label: 'Pilates' },
//     { value: 'CrossFit', label: 'CrossFit' },
//   ]);
  
//   const [formData, setFormData] = useState({
//     nombre: '',
//     email: '',
//     password: '',
//     telefono: '',
//     especialidad: 'General',
//     descripcion: '',
//     experiencia: '',
//     estado: 'activo',
//     horario_disponible: ''
//   });
  
//   // Estados para usuario
//   const userStatuses = [
//     { value: 'activo', label: 'Activo' },
//     { value: 'inactivo', label: 'Inactivo' }
//   ];

//   // Cargar coaches
//   useEffect(() => {
//     const fetchCoaches = async () => {
//       try {
//         setLoading(true);
//         const response = await api.getCoaches();
//         console.log('Coaches obtenidos:', response.data);
//         setCoaches(response.data || []);
//         setFilteredCoaches(response.data || []);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error al cargar coaches:', error);
//         setError('Error al cargar la lista de coaches');
//         setLoading(false);
//       }
//     };
    
//     fetchCoaches();
//   }, []);
  
//   // Filtrar coaches
//   useEffect(() => {
//     let result = [...coaches];
    
//     // Filtrar por especialidad
//     if (filterSpecialty !== 'all') {
//       result = result.filter(coach => coach.especialidad === filterSpecialty);
//     }
    
//     // Filtrar por estado
//     if (filterStatus !== 'all') {
//       result = result.filter(coach => coach.estado === filterStatus);
//     }
    
//     // Filtrar por búsqueda
//     if (searchTerm) {
//       const searchTermLower = searchTerm.toLowerCase();
//       result = result.filter(coach => 
//         (coach.nombre && coach.nombre.toLowerCase().includes(searchTermLower)) ||
//         (coach.email && coach.email.toLowerCase().includes(searchTermLower)) ||
//         (coach.telefono && coach.telefono.toLowerCase().includes(searchTermLower)) ||
//         (coach.especialidad && coach.especialidad.toLowerCase().includes(searchTermLower))
//       );
//     }
    
//     setFilteredCoaches(result);
//   }, [coaches, searchTerm, filterSpecialty, filterStatus]);

//   // Manejar el cierre de sesión
//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate('/login');
//     } catch (error) {
//       console.error('Error al cerrar sesión:', error);
//       setError('Error al cerrar sesión. Por favor intenta nuevamente.');
//     }
//   };

//   // Abrir modal para crear coach
//   const handleOpenCreateModal = () => {
//     setFormData({
//       nombre: '',
//       email: '',
//       password: '',
//       telefono: '',
//       especialidad: 'General',
//       descripcion: '',
//       experiencia: '',
//       estado: 'activo',
//       horario_disponible: ''
//     });
//     setModalType('create');
//     setShowModal(true);
//     setError('');
//     setSuccess('');
//   };

//   // Abrir modal para editar coach
//   const handleOpenEditModal = (coach) => {
//     setFormData({
//       id_coach: coach.id_coach,
//       id_usuario: coach.id_usuario,
//       nombre: coach.nombre || '',
//       email: coach.email || '',
//       password: '', // No mostrar contraseña por seguridad
//       telefono: coach.telefono || '',
//       especialidad: coach.especialidad || 'General',
//       descripcion: coach.descripcion || '',
//       experiencia: coach.experiencia || '',
//       estado: coach.estado || 'activo',
//       horario_disponible: coach.horario_disponible || ''
//     });
//     setSelectedCoach(coach);
//     setModalType('edit');
//     setShowModal(true);
//     setError('');
//     setSuccess('');
//   };

//   // Abrir modal para ver detalles
//   const handleOpenViewModal = (coach) => {
//     setSelectedCoach(coach);
//     setModalType('view');
//     setShowModal(true);
//   };

//   // Abrir modal para confirmar eliminación
//   const handleOpenDeleteModal = (coach) => {
//     setSelectedCoach(coach);
//     setModalType('delete');
//     setShowModal(true);
//     setError('');
//     setSuccess('');
//   };

//   // Cerrar modal
//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedCoach(null);
//     setError('');
//     setSuccess('');
//   };

//   // Manejar cambios en el formulario
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   // Validar formulario
//   const validateForm = () => {
//     if (!formData.nombre) {
//       setError('El nombre es obligatorio');
//       return false;
//     }
//     if (!formData.email) {
//       setError('El email es obligatorio');
//       return false;
//     }
//     if (modalType === 'create' && !formData.password) {
//       setError('La contraseña es obligatoria para nuevos coaches');
//       return false;
//     }
    
//     // Validar formato de email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       setError('El formato del email no es válido');
//       return false;
//     }
    
//     return true;
//   };

//   // Crear o actualizar coach
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }
    
//     try {
//       setLoading(true);
      
//       if (modalType === 'create') {
//         // Crear nuevo coach
//         // Primero se debe crear un usuario con tipo_usuario 'coach'
//         const userData = {
//           nombre: formData.nombre,
//           email: formData.email,
//           password: formData.password,
//           telefono: formData.telefono,
//           tipo_usuario: 'coach',
//           estado: formData.estado
//         };
        
//         // Crear usuario
//         const userResponse = await api.createUser(userData);
        
//         // Ahora crear el coach con los datos adicionales
//         const coachData = {
//           id_usuario: userResponse.userId,
//           especialidad: formData.especialidad,
//           descripcion: formData.descripcion,
//           experiencia: formData.experiencia,
//           horario_disponible: formData.horario_disponible
//         };
        
//         await api.createCoach(coachData);
//         setSuccess('Coach creado exitosamente');
//       } else if (modalType === 'edit') {
//         // Actualizar coach existente
//         const updateData = { ...formData };
//         if (!updateData.password) {
//           delete updateData.password; // No enviar contraseña si está vacía
//         }
        
//         // Actualizar usuario
//         const userData = {
//           nombre: updateData.nombre,
//           email: updateData.email,
//           password: updateData.password,
//           telefono: updateData.telefono,
//           estado: updateData.estado
//         };
        
//         if (updateData.password) {
//           userData.password = updateData.password;
//         }
        
//         await api.updateUser(formData.id_usuario, userData);
        
//         // Actualizar coach
//         const coachData = {
//           especialidad: updateData.especialidad,
//           descripcion: updateData.descripcion,
//           experiencia: updateData.experiencia,
//           horario_disponible: updateData.horario_disponible
//         };
        
//         await api.updateCoach(formData.id_coach, coachData);
//         setSuccess('Coach actualizado exitosamente');
//       }
      
//       // Recargar la lista de coaches
//       const response = await api.getCoaches();
//       setCoaches(response.data || []);
      
//       // Cerrar el modal después de un breve tiempo
//       setTimeout(() => {
//         setShowModal(false);
//         setSuccess('');
//       }, 2000);
      
//       setLoading(false);
//     } catch (error) {
//       console.error('Error al guardar coach:', error);
//       setError(error.response?.data?.message || 'Error al guardar los datos del coach');
//       setLoading(false);
//     }
//   };

//   // Eliminar coach
//   const handleDelete = async () => {
//     try {
//       setLoading(true);
      
//       await api.deleteCoach(selectedCoach.id_coach);
//       setSuccess('Coach eliminado exitosamente');
      
//       // Recargar la lista de coaches
//       const response = await api.getCoaches();
//       setCoaches(response.data || []);
      
//       // Cerrar el modal después de un breve tiempo
//       setTimeout(() => {
//         setShowModal(false);
//         setSuccess('');
//       }, 2000);
      
//       setLoading(false);
//     } catch (error) {
//       console.error('Error al eliminar coach:', error);
//       setError(error.response?.data?.message || 'Error al eliminar el coach');
//       setLoading(false);
//     }
//   };

//   // Función para renderizar el estado con badge
//   const renderStatus = (status) => {
//     let statusClass = '';
//     let statusText = '';
    
//     switch (status) {
//       case 'activo':
//         statusClass = 'status-active';
//         statusText = 'Activo';
//         break;
//       case 'inactivo':
//         statusClass = 'status-inactive';
//         statusText = 'Inactivo';
//         break;
//       default:
//         statusClass = 'status-unknown';
//         statusText = status || 'Desconocido';
//     }
    
//     return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
//   };

//   // Generar opciones únicas para el filtro de especialidad basado en los coaches disponibles
//   const getSpecialtyOptions = useCallback(() => {
//     const uniqueSpecialties = new Set(['all', ...coaches.map(coach => coach.especialidad)].filter(Boolean));
//     return Array.from(uniqueSpecialties).map(specialty => {
//       return {
//         value: specialty,
//         label: specialty === 'all' ? 'Todas las especialidades' : specialty
//       };
//     });
//   }, [coaches]);

//   return (
//     <div className="admin-container">
//       <div className="admin-sidebar">
//         <div className="admin-logo">
//           <h2>FitnessGym</h2>
//         </div>
//         <nav className="admin-nav">
//           <button className="admin-nav-button" onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
//           <button className="admin-nav-button active">Gestión de Coaches</button>
//           <button className="admin-nav-button" onClick={() => navigate('/admin/usuarios')}>Usuarios</button>
//           <button className="admin-nav-button" onClick={() => navigate('/admin/membresias')}>Membresías</button>
//           <button className="admin-nav-button" onClick={handleLogout}>Cerrar sesión</button>
//         </nav>
//       </div>
      
//       <div className="admin-content">
//         <div className="admin-header">
//           <h1>Gestión de Coaches</h1>
//           <div className="admin-profile">
//             <span>{user?.name || 'Administrador'}</span>
//           </div>
//         </div>
        
//         {error && <div className="admin-alert admin-error">{error}</div>}
//         {success && <div className="admin-alert admin-success">{success}</div>}
        
//         <div className="admin-toolbar">
//           <div className="search-filter-container">
//             <div className="search-box">
//               <input
//                 type="text"
//                 placeholder="Buscar coaches..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               <span className="search-icon">🔍</span>
//             </div>
            
//             <div className="filter-container">
//               <select 
//                 value={filterSpecialty} 
//                 onChange={(e) => setFilterSpecialty(e.target.value)}
//                 className="filter-select"
//               >
//                 <option value="all">Todas las especialidades</option>
//                 {specialties.map(specialty => (
//                   <option key={specialty.value} value={specialty.value}>{specialty.label}</option>
//                 ))}
//               </select>
              
//               <select 
//                 value={filterStatus} 
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 className="filter-select"
//               >
//                 <option value="all">Todos los estados</option>
//                 {userStatuses.map(status => (
//                   <option key={status.value} value={status.value}>{status.label}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
          
//           <button 
//             className="admin-primary-button"
//             onClick={handleOpenCreateModal}
//           >
//             <i className="fas fa-plus"></i> Nuevo Coach
//           </button>
//         </div>
        
//         <div className="user-management-container">
//           {loading && !showModal ? (
//             <div className="loading-container">
//               <div className="spinner"></div>
//               <p>Cargando coaches...</p>
//             </div>
//           ) : filteredCoaches.length === 0 ? (
//             <div className="empty-state">
//               <div className="empty-icon">🏋️</div>
//               <h3>No se encontraron coaches</h3>
//               <p>No hay coaches que coincidan con tus criterios de búsqueda o filtros.</p>
//               {(searchTerm || filterSpecialty !== 'all' || filterStatus !== 'all') && (
//                 <button 
//                   className="admin-secondary-button"
//                   onClick={() => {
//                     setSearchTerm('');
//                     setFilterSpecialty('all');
//                     setFilterStatus('all');
//                   }}
//                 >
//                   Limpiar filtros
//                 </button>
//               )}
//             </div>
//           ) : (
//             <div className="user-table-responsive">
//               <table className="user-table">
//                 <thead>
//                   <tr>
//                     <th>ID</th>
//                     <th>Nombre</th>
//                     <th>Email</th>
//                     <th>Teléfono</th>
//                     <th>Especialidad</th>
//                     <th>Estado</th>
//                     <th>Clientes</th>
//                     <th>Acciones</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredCoaches.map(coach => (
//                     <tr key={coach.id_coach}>
//                       <td>{coach.id_coach}</td>
//                       <td>{coach.nombre}</td>
//                       <td>{coach.email}</td>
//                       <td>{coach.telefono || '-'}</td>
//                       <td>{coach.especialidad || 'General'}</td>
//                       <td>{renderStatus(coach.estado)}</td>
//                       <td>{coach.clientes_count || 0}</td>
//                       <td>
//                         <div className="action-buttons">
//                           <button 
//                             className="action-button view"
//                             title="Ver detalles"
//                             onClick={() => handleOpenViewModal(coach)}
//                           >
//                             👁️
//                           </button>
//                           <button 
//                             className="action-button edit"
//                             title="Editar coach"
//                             onClick={() => handleOpenEditModal(coach)}
//                           >
//                             ✏️
//                           </button>
//                           <button 
//                             className="action-button delete"
//                             title="Eliminar coach"
//                             onClick={() => handleOpenDeleteModal(coach)}
//                           >
//                             🗑️
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
        
//         {/* Modal para crear/editar/ver/eliminar coach */}
//         {showModal && (
//           <div className="modal-overlay">
//             <div className={`modal-container ${modalType === 'view' ? 'view-modal' : ''}`}>
//               <div className="modal-header">
//                 <h2>
//                   {modalType === 'create' && 'Nuevo Coach'}
//                   {modalType === 'edit' && 'Editar Coach'}
//                   {modalType === 'view' && 'Detalles del Coach'}
//                   {modalType === 'delete' && 'Eliminar Coach'}
//                 </h2>
//                 <button 
//                   className="modal-close-button"
//                   onClick={handleCloseModal}
//                 >
//                   ×
//                 </button>
//               </div>
              
//               <div className="modal-content">
//                 {error && <div className="admin-alert admin-error">{error}</div>}
//                 {success && <div className="admin-alert admin-success">{success}</div>}
                
//                 {modalType === 'delete' ? (
//                   <div className="delete-confirmation">
//                     <div className="delete-icon">⚠️</div>
//                     <p>¿Estás seguro de que deseas eliminar al coach <strong>{selectedCoach?.nombre}</strong>?</p>
//                     <p>Esta acción no se puede deshacer y afectará a los clientes asignados a este coach.</p>
                    
//                     <div className="modal-actions">
//                       <button 
//                         className="admin-secondary-button"
//                         onClick={handleCloseModal}
//                         disabled={loading}
//                       >
//                         Cancelar
//                       </button>
//                       <button 
//                         className="admin-danger-button"
//                         onClick={handleDelete}
//                         disabled={loading}
//                       >
//                         {loading ? 'Eliminando...' : 'Eliminar Coach'}
//                       </button>
//                     </div>
//                   </div>
//                 ) : modalType === 'view' ? (
//                   <div className="user-details">
//                     <div className="user-avatar">
//                       <div className="avatar-placeholder">
//                         {selectedCoach?.nombre?.charAt(0).toUpperCase() || 'C'}
//                       </div>
//                     </div>
                    
//                     <div className="user-info-grid">
//                       <div className="user-info-item">
//                         <label>ID Coach:</label>
//                         <span>{selectedCoach?.id_coach}</span>
//                       </div>
//                       <div className="user-info-item">
//                         <label>Nombre:</label>
//                         <span>{selectedCoach?.nombre}</span>
//                       </div>
//                       <div className="user-info-item">
//                         <label>Email:</label>
//                         <span>{selectedCoach?.email}</span>
//                       </div>
//                       <div className="user-info-item">
//                         <label>Teléfono:</label>
//                         <span>{selectedCoach?.telefono || 'No especificado'}</span>
//                       </div>
//                       <div className="user-info-item">
//                         <label>Especialidad:</label>
//                         <span>{selectedCoach?.especialidad || 'General'}</span>
//                       </div>
//                       <div className="user-info-item">
//                         <label>Estado:</label>
//                         <span>{renderStatus(selectedCoach?.estado)}</span>
//                       </div>
//                       <div className="user-info-item">
//                         <label>Experiencia:</label>
//                         <span>{selectedCoach?.experiencia || 'No especificada'}</span>
//                       </div>
//                       <div className="user-info-item">
//                         <label>Clientes asignados:</label>
//                         <span>{selectedCoach?.clientes_count || 0}</span>
//                       </div>
//                     </div>
                    
//                     {selectedCoach?.descripcion && (
//                       <div className="coach-description">
//                         <h3>Descripción</h3>
//                         <p>{selectedCoach.descripcion}</p>
//                       </div>
//                     )}
                    
//                     {selectedCoach?.horario_disponible && (
//                       <div className="coach-schedule">
//                         <h3>Horario disponible</h3>
//                         <p>{selectedCoach.horario_disponible}</p>
//                       </div>
//                     )}
                    
//                     <div className="modal-actions">
//                       <button 
//                         className="admin-secondary-button"
//                         onClick={handleCloseModal}
//                       >
//                         Cerrar
//                       </button>
//                       <button 
//                         className="admin-primary-button"
//                         onClick={() => {
//                           handleCloseModal();
//                           handleOpenEditModal(selectedCoach);
//                         }}
//                       >
//                         Editar Coach
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <form onSubmit={handleSubmit} className="user-form">
//                     <div className="form-grid">
//                       <div className="form-group">
//                         <label htmlFor="nombre">Nombre Completo*</label>
//                         <input
//                           type="text"
//                           id="nombre"
//                           name="nombre"
//                           value={formData.nombre}
//                           onChange={handleChange}
//                           required
//                         />
//                       </div>
                      
//                       <div className="form-group">
//                         <label htmlFor="email">Email*</label>
//                         <input
//                           type="email"
//                           id="email"
//                           name="email"
//                           value={formData.email}
//                           onChange={handleChange}
//                           required
//                         />
//                       </div>
                      
//                       <div className="form-group">
//                         <label htmlFor="password">
//                           {modalType === 'create' 
//                             ? 'Contraseña*' 
//                             : 'Contraseña (dejar en blanco para mantener)'}
//                         </label>
//                         <input
//                           type="password"
//                           id="password"
//                           name="password"
//                           value={formData.password}
//                           onChange={handleChange}
//                           required={modalType === 'create'}
//                         />
//                       </div>
                      
//                       <div className="form-group">
//                         <label htmlFor="telefono">Teléfono</label>
//                         <input
//                           type="text"
//                           id="telefono"
//                           name="telefono"
//                           value={formData.telefono}
//                           onChange={handleChange}
//                         />
//                       </div>
                      
//                       <div className="form-group">
//                         <label htmlFor="especialidad">Especialidad*</label>
//                         <select
//                           id="especialidad"
//                           name="especialidad"
//                           value={formData.especialidad}
//                           onChange={handleChange}
//                           required
//                         >
//                           {specialties.map(specialty => (
//                             <option key={specialty.value} value={specialty.value}>{specialty.label}</option>
//                           ))}
//                         </select>
//                       </div>
                      
//                       <div className="form-group">
//                         <label htmlFor="estado">Estado*</label>
//                         <select
//                           id="estado"
//                           name="estado"
//                           value={formData.estado}
//                           onChange={handleChange}
//                           required
//                         >
//                           {userStatuses.map(status => (
//                             <option key={status.value} value={status.value}>{status.label}</option>
//                           ))}
//                         </select>
//                       </div>
                      
//                       <div className="form-group">
//                         <label htmlFor="experiencia">Experiencia (Años)</label>
//                         <input
//                           type="number"
//                           id="experiencia"
//                           name="experiencia"
//                           value={formData.experiencia}
//                           onChange={handleChange}
//                           min="0"
//                         />
//                       </div>
                      
//                       <div className="form-group">
//                         <label htmlFor="horario_disponible">Horario Disponible</label>
//                         <input
//                           type="text"
//                           id="horario_disponible"
//                           name="horario_disponible"
//                           value={formData.horario_disponible}
//                           onChange={handleChange}
//                           placeholder="Ej: Lunes a Viernes 8:00 - 17:00"
//                         />
//                       </div>
//                     </div>
                    
//                     <div className="form-group" style={{ marginTop: '20px' }}>
//                       <label htmlFor="descripcion">Descripción</label>
//                       <textarea
//                         id="descripcion"
//                         name="descripcion"
//                         value={formData.descripcion}
//                         onChange={handleChange}
//                         rows="4"
//                         placeholder="Descripción de la experiencia y habilidades del coach..."
//                       ></textarea>
//                     </div>
                    
//                     <div className="modal-actions">
//                       <button 
//                         type="button" 
//                         className="admin-secondary-button"
//                         onClick={handleCloseModal}
//                         disabled={loading}
//                       >
//                         Cancelar
//                       </button>
//                       <button 
//                         type="submit" 
//                         className="admin-primary-button"
//                         disabled={loading}
//                       >
//                         {loading 
//                           ? (modalType === 'create' ? 'Creando...' : 'Actualizando...') 
//                           : (modalType === 'create' ? 'Crear Coach' : 'Actualizar Coach')}
//                       </button>
//                     </div>
//                   </form>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default GestionCoaches;


// client/src/pages/admin/GestionCoaches.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../cliente/Dashboard.css'; // Usamos el mismo CSS del cliente
import './CoachManagementStyles.css'; // Estilos específicos para gestión de coaches

const GestionCoaches = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'delete', 'view'
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'activo', 'inactivo'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [specialties, setSpecialties] = useState([
    { value: 'General', label: 'General' },
    { value: 'Musculación', label: 'Musculación' },
    { value: 'Funcional', label: 'Funcional' },
    { value: 'Cardio', label: 'Cardio' },
    { value: 'Yoga', label: 'Yoga' },
    { value: 'Pilates', label: 'Pilates' },
    { value: 'CrossFit', label: 'CrossFit' },
  ]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    especialidad: 'General',
    descripcion: '',
    experiencia: '',
    estado: 'activo',
    horario_disponible: ''
  });
  
  // Estados para usuario
  const userStatuses = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' }
  ];

  // Cargar coaches
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoading(true);
        const response = await api.getCoaches();
        console.log('Coaches obtenidos:', response.data);
        setCoaches(response.data || []);
        setFilteredCoaches(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar coaches:', error);
        setError('Error al cargar la lista de coaches');
        setLoading(false);
      }
    };
    
    fetchCoaches();
  }, []);
  
  // Filtrar coaches
  useEffect(() => {
    let result = [...coaches];
    
    // Filtrar por especialidad
    if (filterSpecialty !== 'all') {
      result = result.filter(coach => coach.especialidad === filterSpecialty);
    }
    
    // Filtrar por estado
    if (filterStatus !== 'all') {
      result = result.filter(coach => coach.estado === filterStatus);
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(coach => 
        (coach.nombre && coach.nombre.toLowerCase().includes(searchTermLower)) ||
        (coach.email && coach.email.toLowerCase().includes(searchTermLower)) ||
        (coach.telefono && coach.telefono.toLowerCase().includes(searchTermLower)) ||
        (coach.especialidad && coach.especialidad.toLowerCase().includes(searchTermLower))
      );
    }
    
    setFilteredCoaches(result);
  }, [coaches, searchTerm, filterSpecialty, filterStatus]);

  // Manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión. Por favor intenta nuevamente.');
    }
  };

  // Todas las funciones del modal permanecen igual...
  const handleOpenCreateModal = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      especialidad: 'General',
      descripcion: '',
      experiencia: '',
      estado: 'activo',
      horario_disponible: ''
    });
    setModalType('create');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleOpenEditModal = (coach) => {
    setFormData({
      id_coach: coach.id_coach,
      id_usuario: coach.id_usuario,
      nombre: coach.nombre || '',
      email: coach.email || '',
      password: '',
      telefono: coach.telefono || '',
      especialidad: coach.especialidad || 'General',
      descripcion: coach.descripcion || '',
      experiencia: coach.experiencia || '',
      estado: coach.estado || 'activo',
      horario_disponible: coach.horario_disponible || ''
    });
    setSelectedCoach(coach);
    setModalType('edit');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleOpenViewModal = (coach) => {
    setSelectedCoach(coach);
    setModalType('view');
    setShowModal(true);
  };

  const handleOpenDeleteModal = (coach) => {
    setSelectedCoach(coach);
    setModalType('delete');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCoach(null);
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
      setError('La contraseña es obligatoria para nuevos coaches');
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
      
      if (modalType === 'create') {
        const userData = {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono,
          tipo_usuario: 'coach',
          estado: formData.estado
        };
        
        const userResponse = await api.createUser(userData);
        
        const coachData = {
          id_usuario: userResponse.userId,
          especialidad: formData.especialidad,
          descripcion: formData.descripcion,
          experiencia: formData.experiencia,
          horario_disponible: formData.horario_disponible
        };
        
        await api.createCoach(coachData);
        setSuccess('Coach creado exitosamente');
      } else if (modalType === 'edit') {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        const userData = {
          nombre: updateData.nombre,
          email: updateData.email,
          password: updateData.password,
          telefono: updateData.telefono,
          estado: updateData.estado
        };
        
        if (updateData.password) {
          userData.password = updateData.password;
        }
        
        await api.updateUser(formData.id_usuario, userData);
        
        const coachData = {
          especialidad: updateData.especialidad,
          descripcion: updateData.descripcion,
          experiencia: updateData.experiencia,
          horario_disponible: updateData.horario_disponible
        };
        
        await api.updateCoach(formData.id_coach, coachData);
        setSuccess('Coach actualizado exitosamente');
      }
      
      const response = await api.getCoaches();
      setCoaches(response.data || []);
      
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 2000);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al guardar coach:', error);
      setError(error.response?.data?.message || 'Error al guardar los datos del coach');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      await api.deleteCoach(selectedCoach.id_coach);
      setSuccess('Coach eliminado exitosamente');
      
      const response = await api.getCoaches();
      setCoaches(response.data || []);
      
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 2000);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al eliminar coach:', error);
      setError(error.response?.data?.message || 'Error al eliminar el coach');
      setLoading(false);
    }
  };

  const renderStatus = (status) => {
    let statusClass = '';
    let statusText = '';
    
    switch (status) {
      case 'activo':
        statusClass = 'status-active';
        statusText = 'Activo';
        break;
      case 'inactivo':
        statusClass = 'status-inactive';
        statusText = 'Inactivo';
        break;
      default:
        statusClass = 'status-unknown';
        statusText = status || 'Desconocido';
    }
    
    return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
  };

  const getSpecialtyOptions = useCallback(() => {
    const uniqueSpecialties = new Set(['all', ...coaches.map(coach => coach.especialidad)].filter(Boolean));
    return Array.from(uniqueSpecialties).map(specialty => {
      return {
        value: specialty,
        label: specialty === 'all' ? 'Todas las especialidades' : specialty
      };
    });
  }, [coaches]);

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
          <button className="menu-button active">Gestión de Coaches</button>
          <button className="menu-button" onClick={() => navigate('/admin/usuarios')}>Usuarios</button>
          <button className="menu-button" onClick={() => navigate('/admin/membresias')}>Membresías</button>
          <button className="menu-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="content-wrapper">
          <div className="user-card">
            <div className="user-avatar">
              <img src="/src/assets/icons/admin.png" alt="Admin Avatar" width="50" height="50" />
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'Administrador'}</div>
              <div className="membership-details">
                <span>Administrador del Sistema</span>
                <span>Gestión de Coaches</span>
              </div>
            </div>
          </div>
          
          <h1 className="page-title">Gestión de Coaches</h1>
          
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
          
          <div className="coaches-management-container">
            <div className="toolbar">
              <div className="search-filter-container">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Buscar coaches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>
                
                <div className="filter-container">
                  <select 
                    value={filterSpecialty} 
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Todas las especialidades</option>
                    {specialties.map(specialty => (
                      <option key={specialty.value} value={specialty.value}>{specialty.label}</option>
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
                <span>➕</span> Nuevo Coach
              </button>
            </div>
            
            {loading && !showModal ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando coaches...</p>
              </div>
            ) : filteredCoaches.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏋️</div>
                <h3>No se encontraron coaches</h3>
                <p>No hay coaches que coincidan con tus criterios de búsqueda o filtros.</p>
                {(searchTerm || filterSpecialty !== 'all' || filterStatus !== 'all') && (
                  <button 
                    className="secondary-button"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterSpecialty('all');
                      setFilterStatus('all');
                    }}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Especialidad</th>
                      <th>Estado</th>
                      <th>Clientes</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoaches.map(coach => (
                      <tr key={coach.id_coach}>
                        <td>{coach.id_coach}</td>
                        <td>{coach.nombre}</td>
                        <td>{coach.email}</td>
                        <td>{coach.telefono || '-'}</td>
                        <td>{coach.especialidad || 'General'}</td>
                        <td>{renderStatus(coach.estado)}</td>
                        <td>{coach.clientes_count || 0}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-button view"
                              title="Ver detalles"
                              onClick={() => handleOpenViewModal(coach)}
                            >
                              👁️
                            </button>
                            <button 
                              className="action-button edit"
                              title="Editar coach"
                              onClick={() => handleOpenEditModal(coach)}
                            >
                              ✏️
                            </button>
                            <button 
                              className="action-button delete"
                              title="Eliminar coach"
                              onClick={() => handleOpenDeleteModal(coach)}
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
        </div>
        
        {/* Modal - permanece igual pero con clases actualizadas */}
        {showModal && (
          <div className="modal-overlay">
            <div className={`modal-container ${modalType === 'view' ? 'view-modal' : ''}`}>
              <div className="modal-header">
                <h2>
                  {modalType === 'create' && 'Nuevo Coach'}
                  {modalType === 'edit' && 'Editar Coach'}
                  {modalType === 'view' && 'Detalles del Coach'}
                  {modalType === 'delete' && 'Eliminar Coach'}
                </h2>
                <button 
                  className="modal-close-button"
                  onClick={handleCloseModal}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                {modalType === 'delete' ? (
                  <div className="delete-confirmation">
                    <div className="delete-icon">⚠️</div>
                    <p>¿Estás seguro de que deseas eliminar al coach <strong>{selectedCoach?.nombre}</strong>?</p>
                    <p>Esta acción no se puede deshacer y afectará a los clientes asignados a este coach.</p>
                    
                    <div className="modal-actions">
                      <button 
                        className="secondary-button"
                        onClick={handleCloseModal}
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button 
                        className="danger-button"
                        onClick={handleDelete}
                        disabled={loading}
                      >
                        {loading ? 'Eliminando...' : 'Eliminar Coach'}
                      </button>
                    </div>
                  </div>
                ) : modalType === 'view' ? (
                  <div className="coach-details">
                    <div className="coach-avatar">
                      <div className="avatar-placeholder">
                        {selectedCoach?.nombre?.charAt(0).toUpperCase() || 'C'}
                      </div>
                    </div>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <label>ID Coach:</label>
                        <span>{selectedCoach?.id_coach}</span>
                      </div>
                      <div className="info-item">
                        <label>Nombre:</label>
                        <span>{selectedCoach?.nombre}</span>
                      </div>
                      <div className="info-item">
                        <label>Email:</label>
                        <span>{selectedCoach?.email}</span>
                      </div>
                      <div className="info-item">
                        <label>Teléfono:</label>
                        <span>{selectedCoach?.telefono || 'No especificado'}</span>
                      </div>
                      <div className="info-item">
                        <label>Especialidad:</label>
                        <span>{selectedCoach?.especialidad || 'General'}</span>
                      </div>
                      <div className="info-item">
                        <label>Estado:</label>
                        <span>{renderStatus(selectedCoach?.estado)}</span>
                      </div>
                      <div className="info-item">
                        <label>Experiencia:</label>
                        <span>{selectedCoach?.experiencia || 'No especificada'}</span>
                      </div>
                      <div className="info-item">
                        <label>Clientes asignados:</label>
                        <span>{selectedCoach?.clientes_count || 0}</span>
                      </div>
                    </div>
                    
                    {selectedCoach?.descripcion && (
                      <div className="description-section">
                        <h3>Descripción</h3>
                        <p>{selectedCoach.descripcion}</p>
                      </div>
                    )}
                    
                    {selectedCoach?.horario_disponible && (
                      <div className="schedule-section">
                        <h3>Horario disponible</h3>
                        <p>{selectedCoach.horario_disponible}</p>
                      </div>
                    )}
                    
                    <div className="modal-actions">
                      <button 
                        className="secondary-button"
                        onClick={handleCloseModal}
                      >
                        Cerrar
                      </button>
                      <button 
                        className="primary-button"
                        onClick={() => {
                          handleCloseModal();
                          handleOpenEditModal(selectedCoach);
                        }}
                      >
                        Editar Coach
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="coach-form">
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
                        <label htmlFor="especialidad">Especialidad*</label>
                        <select
                          id="especialidad"
                          name="especialidad"
                          value={formData.especialidad}
                          onChange={handleChange}
                          required
                        >
                          {specialties.map(specialty => (
                            <option key={specialty.value} value={specialty.value}>{specialty.label}</option>
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
                      
                      <div className="form-group">
                        <label htmlFor="experiencia">Experiencia (Años)</label>
                        <input
                          type="number"
                          id="experiencia"
                          name="experiencia"
                          value={formData.experiencia}
                          onChange={handleChange}
                          min="0"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="horario_disponible">Horario Disponible</label>
                        <input
                          type="text"
                          id="horario_disponible"
                          name="horario_disponible"
                          value={formData.horario_disponible}
                          onChange={handleChange}
                          placeholder="Ej: Lunes a Viernes 8:00 - 17:00"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="descripcion">Descripción</label>
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Descripción de la experiencia y habilidades del coach..."
                      ></textarea>
                    </div>
                    
                    <div className="modal-actions">
                      <button 
                        type="button" 
                        className="secondary-button"
                        onClick={handleCloseModal}
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="primary-button"
                        disabled={loading}
                      >
                        {loading 
                          ? (modalType === 'create' ? 'Creando...' : 'Actualizando...') 
                          : (modalType === 'create' ? 'Crear Coach' : 'Actualizar Coach')}
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

export default GestionCoaches;
