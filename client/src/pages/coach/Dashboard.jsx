// client/src/pages/coach/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css';

const CoachDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clients');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener clientes asignados
        const clientsResponse = await api.getCoachClients();
        setClients(clientsResponse.data || []);
        
        // Obtener solicitudes pendientes
        const requestsResponse = await api.getCoachPendingRequests();
        setPendingRequests(requestsResponse.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Función para aceptar solicitud de cliente
  const handleAcceptRequest = async (requestId) => {
    try {
      setLoading(true);
      
      await api.acceptClientRequest(requestId);
      
      // Mostrar notificación de éxito
      setNotification({
        type: 'success',
        message: 'Solicitud aceptada correctamente'
      });
      
      // Actualizar listas después de aceptar
      const clientsResponse = await api.getCoachClients();
      setClients(clientsResponse.data || []);
      
      const requestsResponse = await api.getCoachPendingRequests();
      setPendingRequests(requestsResponse.data || []);
      
      setLoading(false);
      
      // Limpiar notificación después de 3 segundos
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);
      
      setNotification({
        type: 'error',
        message: 'Error al aceptar solicitud'
      });
      
      setLoading(false);
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Función para rechazar solicitud de cliente
  const handleRejectRequest = async (requestId) => {
    try {
      setLoading(true);
      
      await api.rejectClientRequest(requestId);
      
      // Mostrar notificación de éxito
      setNotification({
        type: 'success',
        message: 'Solicitud rechazada correctamente'
      });
      
      // Actualizar lista de solicitudes
      const requestsResponse = await api.getCoachPendingRequests();
      setPendingRequests(requestsResponse.data || []);
      
      setLoading(false);
      
      // Limpiar notificación después de 3 segundos
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      
      setNotification({
        type: 'error',
        message: 'Error al rechazar solicitud'
      });
      
      setLoading(false);
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  return (
    <div className="coach-container">
      <div className="coach-sidebar">
        <div className="coach-logo">
          <div className="logo-circle">
            <img src="/src/assets/icons/logo.png" alt="Logo Gimnasio" width="60" height="60" />
          </div>
        </div>
        
        <nav className="coach-nav">
          <button className="coach-nav-button active">Dashboard</button>
          <button className="coach-nav-button" onClick={() => navigate('/coach/rutinas')}>Rutinas</button>
          <button className="coach-nav-button" onClick={() => navigate('/coach/perfil')}>Mi Perfil</button>
          <button className="coach-nav-button" onClick={logout}>Cerrar sesión</button>
        </nav>
      </div>
      
      <div className="coach-content">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        <div className="coach-header">
          <h1>Dashboard de Entrenador</h1>
          <div className="coach-profile">
            <span>{user?.name || 'Entrenador'}</span>
            <div className="coach-avatar">
              <img src="/src/assets/icons/usuario.png" alt="Avatar" width="40" height="40" />
            </div>
          </div>
        </div>
        
        <div className="coach-tabs">
          <button 
            className={`coach-tab ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            Mis Clientes ({clients.length})
          </button>
          <button 
            className={`coach-tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Solicitudes Pendientes 
            {pendingRequests.length > 0 && (
              <span className="notification-badge">{pendingRequests.length}</span>
            )}
          </button>
        </div>
        
        {activeTab === 'clients' && (
          <div className="coach-section">
            <h2>Mis Clientes</h2>
            
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando clientes...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="empty-state">
                <p>No tienes clientes asignados actualmente.</p>
              </div>
            ) : (
              <div className="client-cards">
                {clients.map(client => (
                  <div key={client.id_usuario} className="client-card">
                    <div className="client-info">
                      <div className="client-avatar">
                        <img src="/src/assets/icons/usuario.png" alt="Avatar" width="50" height="50" />
                      </div>
                      <div className="client-details">
                        <h3>{client.nombre}</h3>
                        <p>{client.email}</p>
                        <p className="assignment-date">
                          <small>Asignado desde: {new Date(client.fecha_asignacion).toLocaleDateString()}</small>
                        </p>
                      </div>
                    </div>
                    <div className="client-actions">
                      <button className="coach-button primary" onClick={() => navigate(`/coach/cliente/${client.id_usuario}`)}>
                        Ver detalles
                      </button>
                      <button className="coach-button secondary" onClick={() => navigate(`/coach/rutina/${client.id_usuario}`)}>
                        Asignar rutina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'requests' && (
          <div className="coach-section">
            <h2>Solicitudes Pendientes</h2>
            
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando solicitudes...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="empty-state">
                <p>No hay solicitudes pendientes en este momento.</p>
              </div>
            ) : (
              <div className="request-table-container">
                <table className="coach-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Email</th>
                      <th>Fecha solicitud</th>
                      <th>Tipo membresía</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map(request => (
                      <tr key={request.id_asignacion}>
                        <td>{request.nombre}</td>
                        <td>{request.email}</td>
                        <td>{new Date(request.fecha_asignacion).toLocaleDateString()}</td>
                        <td>{request.tipo_membresia || 'No especificado'}</td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="action-button accept"
                              onClick={() => handleAcceptRequest(request.id_asignacion)}
                            >
                              Aceptar
                            </button>
                            <button 
                              className="action-button reject"
                              onClick={() => handleRejectRequest(request.id_asignacion)}
                            >
                              Rechazar
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
        )}
      </div>
    </div>
  );
};

export default CoachDashboard;