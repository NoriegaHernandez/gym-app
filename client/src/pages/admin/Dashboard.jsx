// export default AdminDashboard;
// client/src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminStyles.css';
import './CoachFixes.css';
import './DashboardFixes.css'; // Asegúrate de tener este archivo CSS para estilos específicos


const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCoaches: 0,
    activeSubscriptions: 0,
    pendingVerifications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Para forzar actualizaciones
  
  // Estados para interactividad
  const [timeFilter, setTimeFilter] = useState('all'); // 'today', 'week', 'month', 'all'
  const [activityFilter, setActivityFilter] = useState('all'); // 'all', 'new_user', 'subscription_renewal', 'coach_assignment'
  const [filteredActivity, setFilteredActivity] = useState([]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [statsTimeframe, setStatsTimeframe] = useState('month'); // 'week', 'month', 'year'
  const [statsComparisonData, setStatsComparisonData] = useState({
    totalUsers: { current: 0, previous: 0 },
    activeUsers: { current: 0, previous: 0 },
    totalCoaches: { current: 0, previous: 0 },
    activeSubscriptions: { current: 0, previous: 0 }
  });

  // Función para forzar refresco de datos
  const refreshData = useCallback(() => {
    console.log('Forzando actualización de datos...');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Verificar autenticación y cargar datos iniciales
  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!user) {
      navigate('/login');
      return;
    }

    fetchDashboardData();

    // Configurar actualización automática cada 30 segundos
    const intervalId = setInterval(() => {
      console.log('Actualizando datos automáticamente...');
      fetchDashboardData();
    }, 30000);

    // Limpiar intervalo al desmontar componente
    return () => clearInterval(intervalId);
    
  }, [user, navigate, refreshTrigger]); // Incluir refreshTrigger para forzar actualizaciones

  // Cargar datos del dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener estadísticas principales
      const statsResponse = await api.getAdminStats(statsTimeframe);
      console.log('Estadísticas obtenidas:', statsResponse);
      setStats(statsResponse);
      
      // Obtener datos comparativos
      const comparisonResponse = await api.getStatsComparison(statsTimeframe);
      console.log('Datos comparativos obtenidos:', comparisonResponse);
      setStatsComparisonData(comparisonResponse);
      
      // Obtener actividad reciente (inicialmente sin filtros, limitado a 3)
      const activityFilters = { limit: 3 };
      const activityResponse = await api.getRecentActivity(activityFilters);
      console.log('Actividad reciente obtenida:', activityResponse);
      setRecentActivity(activityResponse);
      setFilteredActivity(activityResponse);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      setError('Error al cargar los datos del dashboard. Por favor, intenta nuevamente.');
      setLoading(false);
    }
  };

  // Actualizar datos cuando cambia el período de estadísticas
  useEffect(() => {
    if (user) {
      fetchStatsForTimeframe(statsTimeframe);
    }
  }, [statsTimeframe, user, refreshTrigger]);

  // Actualizar la actividad cuando cambian los filtros
  useEffect(() => {
    if (user) {
      fetchFilteredActivity();
    }
  }, [timeFilter, activityFilter, showAllActivity, user, refreshTrigger]);

  // Obtener estadísticas según el período seleccionado
  const fetchStatsForTimeframe = async (timeframe) => {
    try {
      setLoading(true);
      
      // Obtener estadísticas principales para el período seleccionado
      const statsResponse = await api.getAdminStats(timeframe);
      setStats(statsResponse);
      
      // Obtener datos comparativos para el período seleccionado
      const comparisonResponse = await api.getStatsComparison(timeframe);
      setStatsComparisonData(comparisonResponse);
      
      setLoading(false);
    } catch (error) {
      console.error(`Error al cargar estadísticas para ${timeframe}:`, error);
      setError(`Error al cargar estadísticas para ${timeframe}`);
      setLoading(false);
    }
  };

  // Obtener actividad filtrada
  const fetchFilteredActivity = async () => {
    try {
      setLoadingActivity(true);
      
      // Construir filtros
      const filters = {
        type: activityFilter !== 'all' ? activityFilter : undefined,
        timeFilter: timeFilter !== 'all' ? timeFilter : undefined,
        limit: showAllActivity ? 20 : 3 // Limitar a 3 si no se muestra todo
      };
      
      // Obtener actividad filtrada
      const activityResponse = await api.getRecentActivity(filters);
      setFilteredActivity(activityResponse);
      
      setLoadingActivity(false);
    } catch (error) {
      console.error('Error al cargar actividad filtrada:', error);
      setLoadingActivity(false);
    }
  };

  // Manejar el cambio de período de estadísticas
  const handleStatsTimeframeChange = (timeframe) => {
    setStatsTimeframe(timeframe);
  };

  // Manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await logout();
      // Redireccionar a la página de inicio de sesión después de cerrar sesión
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión. Por favor intenta nuevamente.');
    }
  };

  // Función para calcular el cambio porcentual
  const calculatePercentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0; // Si no había datos previos
    return Math.round(((current - previous) / previous) * 100);
  };

  // Función para renderizar el indicador de tendencia
  const renderTrendIndicator = (current, previous) => {
    const percentChange = calculatePercentChange(current, previous);
    const isPositive = current >= previous;
    
    // Si ambos valores son 0, no mostrar indicador
    if (current === 0 && previous === 0) {
      return <div className="trend-indicator neutral">Sin cambios</div>;
    }
    
    return (
      <div className={`trend-indicator ${isPositive ? 'positive' : 'negative'}`}>
        <span className="trend-arrow">{isPositive ? '↑' : '↓'}</span>
        <span className="trend-percent">{Math.abs(percentChange)}%</span>
      </div>
    );
  };

  // Obtener el texto del período anterior
  const getPreviousPeriodText = () => {
    switch (statsTimeframe) {
      case 'week':
        return 'la semana anterior';
      case 'month':
        return 'el mes anterior';
      case 'year':
        return 'el año anterior';
      default:
        return 'el período anterior';
    }
  };

  // Función para renderizar el icono de tipo de actividad
  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'new_user':
        return 'Nuevo usuario';
      case 'subscription_renewal':
        return 'Renovación de suscripción';
      case 'coach_assignment':
        return 'Asignación de entrenador';
      default:
        return type || 'Actividad';
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>FitnessGym</h2>
        </div>
        <nav className="admin-nav">
          <button className="admin-nav-button active">Dashboard</button>
          <button className="admin-nav-button" onClick={() => navigate('/admin/coaches')}>Gestión de Coaches</button>
          <button className="admin-nav-button" onClick={() => navigate('/admin/usuarios')}>Usuarios</button>
          <button className="admin-nav-button" onClick={() => navigate('/admin/membresias')}>Membresías</button>
          <button className="admin-nav-button" onClick={handleLogout}>Cerrar sesión</button>
        </nav>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Dashboard de Administrador</h1>
          <div className="admin-profile">
            <div className="admin-header-actions">
              <button 
                className="refresh-button" 
                onClick={refreshData} 
                title="Actualizar datos"
              >
                🔄 Actualizar
              </button>
              <span>{user?.name || 'Administrador'}</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="admin-alert admin-error">
            <p>{error}</p>
            <button className="admin-alert-close" onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando datos del dashboard...</p>
          </div>
        ) : (
          <>
            <div className="stats-timeframe-selector">
              <span>Ver estadísticas comparadas con: </span>
              <div className="timeframe-buttons">
                <button 
                  className={`timeframe-button ${statsTimeframe === 'week' ? 'active' : ''}`}
                  onClick={() => handleStatsTimeframeChange('week')}
                >
                  Semana
                </button>
                <button 
                  className={`timeframe-button ${statsTimeframe === 'month' ? 'active' : ''}`}
                  onClick={() => handleStatsTimeframeChange('month')}
                >
                  Mes
                </button>
                <button 
                  className={`timeframe-button ${statsTimeframe === 'year' ? 'active' : ''}`}
                  onClick={() => handleStatsTimeframeChange('year')}
                >
                  Año
                </button>
              </div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card interactive">
                <div className="stat-header">
                  <h3>Total Usuarios</h3>
                  {renderTrendIndicator(
                    statsComparisonData.totalUsers.current,
                    statsComparisonData.totalUsers.previous
                  )}
                </div>
                <p className="stat-value">{stats.totalUsers}</p>
                <p className="stat-description">
                  <span className="stat-comparison">
                    {statsComparisonData.totalUsers.previous} en {getPreviousPeriodText()}
                  </span>
                  <br />
                  Usuarios registrados en el sistema
                </p>
                <div className="stat-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(100, (stats.totalUsers > 0 ? 
                        (statsComparisonData.totalUsers.current / (statsComparisonData.totalUsers.current * 1.2)) * 100 : 0))}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="stat-card interactive">
                <div className="stat-header">
                  <h3>Usuarios Activos</h3>
                  {renderTrendIndicator(
                    statsComparisonData.activeUsers.current,
                    statsComparisonData.activeUsers.previous
                  )}
                </div>
                <p className="stat-value">{stats.activeUsers}</p>
                <p className="stat-description">
                  <span className="stat-comparison">
                    {statsComparisonData.activeUsers.previous} en {getPreviousPeriodText()}
                  </span>
                  <br />
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% del total de usuarios
                </p>
                <div className="stat-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(100, (stats.totalUsers > 0 ? 
                        (stats.activeUsers / stats.totalUsers) * 100 : 0))}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="stat-card interactive">
                <div className="stat-header">
                  <h3>Entrenadores</h3>
                  {renderTrendIndicator(
                    statsComparisonData.totalCoaches.current,
                    statsComparisonData.totalCoaches.previous
                  )}
                </div>
                <p className="stat-value">{stats.totalCoaches}</p>
                <p className="stat-description">
                  <span className="stat-comparison">
                    {statsComparisonData.totalCoaches.previous} en {getPreviousPeriodText()}
                  </span>
                  <br />
                  Entrenadores en la plataforma
                </p>
                <div className="stat-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(100, (stats.totalCoaches > 0 ? 
                        (statsComparisonData.totalCoaches.current / (stats.totalCoaches * 2)) * 100 : 0))}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="stat-card interactive">
                <div className="stat-header">
                  <h3>Suscripciones Activas</h3>
                  {renderTrendIndicator(
                    statsComparisonData.activeSubscriptions.current,
                    statsComparisonData.activeSubscriptions.previous
                  )}
                </div>
                <p className="stat-value">{stats.activeSubscriptions}</p>
                <p className="stat-description">
                  <span className="stat-comparison">
                    {statsComparisonData.activeSubscriptions.previous} en {getPreviousPeriodText()}
                  </span>
                  <br />
                  Membresías vigentes
                </p>
                <div className="stat-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(100, (stats.totalUsers > 0 ? 
                        (stats.activeSubscriptions / stats.totalUsers) * 100 : 0))}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="admin-row">
              <div className="admin-card">
                <div className="card-header-with-actions">
                  <h2>Actividad Reciente</h2>
                  <div className="activity-filters">
                    <select 
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      className="activity-filter-select"
                    >
                      <option value="all">Todos los tipos</option>
                      <option value="new_user">Nuevos usuarios</option>
                      <option value="subscription_renewal">Renovaciones</option>
                      <option value="coach_assignment">Asignaciones</option>
                    </select>
                    
                    <select 
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="activity-filter-select"
                    >
                      <option value="all">Todo el tiempo</option>
                      <option value="today">Hoy</option>
                      <option value="week">Esta semana</option>
                      <option value="month">Este mes</option>
                    </select>
                  </div>
                </div>
                
                <div className="activity-list">
                  {loadingActivity ? (
                    <div className="loading-container">
                      <div className="spinner"></div>
                      <p>Cargando actividades...</p>
                    </div>
                  ) : filteredActivity.length === 0 ? (
                    <div className="empty-activity">
                      <p>No hay actividades que coincidan con los filtros seleccionados.</p>
                      <p>Las actividades se registrarán automáticamente cuando los usuarios realicen acciones en el sistema.</p>
                      <button 
                        className="admin-secondary-button" 
                        onClick={refreshData}
                        style={{ marginTop: '10px' }}
                      >
                        Verificar nuevamente
                      </button>
                    </div>
                  ) : (
                    filteredActivity.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className={`activity-icon ${activity.type}`}></div>
                        <div className="activity-details">
                          <p className="activity-description">{activity.description}</p>
                          <p className="activity-date">{activity.date}</p>
                        </div>
                        <div className="activity-type-label">
                          {getActivityTypeLabel(activity.type)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <button 
                  className="admin-secondary-button view-all"
                  onClick={() => setShowAllActivity(!showAllActivity)}
                  disabled={filteredActivity.length === 0}
                >
                  {showAllActivity ? 'Ver menos' : 'Ver todas las actividades'}
                </button>
              </div>
              
              <div className="admin-card">
                <h2>Acciones Rápidas</h2>
                
                <div className="quick-actions">
                  <button className="quick-action-button" onClick={() => navigate('/admin/usuarios/nuevo')}>
                    <div className="quick-action-icon user"></div>
                    <span>Nuevo Usuario</span>
                  </button>
                  
                  <button className="quick-action-button" onClick={() => navigate('/admin/coaches')}>
                    <div className="quick-action-icon coach"></div>
                    <span>Agregar Coach</span>
                  </button>
                  
                  <button className="quick-action-button" onClick={() => navigate('/admin/membresias')}>
                    <div className="quick-action-icon subscription"></div>
                    <span>Gestionar Membresías</span>
                  </button>
                  
                  <button className="quick-action-button" onClick={() => navigate('/admin/verificaciones')}>
                    <div className="quick-action-icon verify"></div>
                    <span>Verificaciones Pendientes ({stats.pendingVerifications})</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;