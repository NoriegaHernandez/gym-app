

// client/src/pages/cliente/Membresia.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css'; // Reutilizamos los estilos
import './Membresia.css'; // Estilos específicos para membresía

const Membresia = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [membershipData, setMembershipData] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de membresía al iniciar
  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        setLoading(true);
        setError(null); // Limpiar error previo
        
        // Intentar obtener la membresía actual
        let membershipData = null;
        try {
          console.log('Solicitando información de membresía...');
          const membershipResponse = await api.getCurrentUserMembership();
          console.log('Respuesta de membresía:', membershipResponse);
          membershipData = membershipResponse;
        } catch (membershipError) {
          console.error('Error al obtener membresía:', membershipError);
          // Establecer valores por defecto
          membershipData = { estado_membresia: 'inactiva' };
        }
        
        // Siempre actualizar el estado con lo que obtuvimos (incluso si hubo error)
        setMembershipData(membershipData);
        
        // Intentar obtener planes disponibles para mostrar información
        let plansData = [];
        try {
          console.log('Solicitando planes disponibles...');
          const plansResponse = await api.getClientAvailablePlans();
          console.log('Respuesta de planes:', plansResponse);
          plansData = plansResponse || [];
        } catch (plansError) {
          console.error('Error al obtener planes:', plansError);
          // Mantener array vacío en caso de error
        }
        
        // Siempre actualizar el estado con lo que obtuvimos
        setAvailablePlans(plansData);
        
        setLoading(false);
      } catch (generalError) {
        console.error('Error general al cargar datos:', generalError);
        setError('Ocurrió un error al cargar los datos. Por favor, inténtalo de nuevo más tarde.');
        setLoading(false);
        
        // Establecer estados por defecto para evitar errores en la UI
        setMembershipData({ estado_membresia: 'inactiva' });
        setAvailablePlans([]);
      }
    };
    
    fetchMembershipData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Abrir modal de renovación o cambio de plan
  const handleOpenPlanModal = (plan) => {
    setSelectedPlan(plan);
    setSelectedType('mensual'); // Establecer tipo por defecto
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
    setError(null);
  };

  // Manejar la renovación o cambio de plan
  const handleChangePlan = async () => {
    if (!selectedPlan) {
      setError('No se ha seleccionado un plan válido');
      return;
    }

    try {
      setLoading(true);
      setError(null); // Limpiar errores previos
      
      // Determinar duración en días según el tipo de plan
      let duracionDias;
      let descuento = 1; // Sin descuento por defecto
      
      if (selectedType === 'mensual') {
        duracionDias = 30;
      } else if (selectedType === 'trimestral') {
        duracionDias = 90;
        descuento = 0.9; // 10% descuento
      } else if (selectedType === 'anual') {
        duracionDias = 365;
        descuento = 0.85; // 15% descuento
      }
      
      // Calcular precio con descuento
      const precioPagado = parseFloat((selectedPlan.precio * (selectedType === 'mensual' ? 1 : (selectedType === 'trimestral' ? 3 : 12)) * descuento).toFixed(2));
      
      console.log('Precio calculado:', precioPagado);
      
      // Datos para crear o renovar membresía
      const membershipData = {
        id_plan: selectedPlan.id_plan,
        tipo_plan: selectedType,
        fecha_inicio: new Date().toISOString().split('T')[0],
        duracion_dias: duracionDias,
        precio_pagado: precioPagado,
        metodo_pago: paymentMethod
      };
      
      console.log('Datos de membresía a enviar:', membershipData);
      
      // Si tiene una membresía activa, renovarla
      if (membershipData && membershipData.id_suscripcion && membershipData.estado_membresia === 'activa') {
        console.log('Renovando membresía existente');
        try {
          await api.renewClientMembership(membershipData.id_suscripcion, membershipData);
          setSuccess('Membresía renovada exitosamente');
        } catch (renewError) {
          console.error('Error al renovar membresía:', renewError);
          setError('No se pudo renovar la membresía. Por favor, inténtalo de nuevo más tarde.');
          setLoading(false);
          return;
        }
      } else {
        // Si no tiene membresía activa, crear una nueva
        console.log('Creando nueva membresía');
        try {
          await api.createClientMembership(membershipData);
          setSuccess('Membresía creada exitosamente');
        } catch (createError) {
          console.error('Error al crear membresía:', createError);
          setError('No se pudo crear la membresía. Por favor, inténtalo de nuevo más tarde.');
          setLoading(false);
          return;
        }
      }
      
      // Recargar datos de membresía después de crear/renovar
      try {
        const response = await api.getCurrentUserMembership();
        setMembershipData(response);
      } catch (refreshError) {
        console.error('Error al actualizar datos de membresía:', refreshError);
        // No mostramos este error al usuario, ya que la operación principal fue exitosa
      }
      
      setShowModal(false);
      setLoading(false);
      
      // Mostrar mensaje de éxito temporalmente
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error general al cambiar plan:', err);
      setError('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
      setLoading(false);
    }
  };

  // Calcular y formatear precio para mostrar
  const calculatePlanPrice = (basePrecio, tipo) => {
    let precio = basePrecio;
    let descuento = 0;
    
    if (tipo === 'trimestral') {
      precio = basePrecio * 3;
      descuento = 10;
      precio = precio * 0.9; // 10% descuento
    } else if (tipo === 'anual') {
      precio = basePrecio * 12;
      descuento = 15;
      precio = precio * 0.85; // 15% descuento
    }
    
    return {
      precio: precio.toFixed(2),
      descuento: descuento
    };
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
          <button className="menu-button" onClick={() => navigate('/cliente/informacion')}>Información</button>
          <button className="menu-button active">Membresía</button>
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
              <span>Estado de la membresía: {membershipData?.estado_membresia ? (
                membershipData.estado_membresia === 'activa' ? 'Activa' : 'Inactiva'
              ) : 'Sin membresía'}</span>
              {membershipData?.fecha_fin && membershipData.estado_membresia === 'activa' && (
                <span>Fecha de vencimiento: {formatDate(membershipData.fecha_fin)}</span>
              )}
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
            <p>Cargando información de membresía...</p>
          </div>
        ) : (
          <div className="membership-container">
            <h2>Tu Membresía</h2>
            
            {membershipData && membershipData.estado_membresia === 'activa' ? (
              <div className="membership-card active">
                <div className="membership-header">
                  <h3>Membresía Actual</h3>
                  <span className="membership-status active">Activa</span>
                </div>
                
                <div className="membership-details-expanded">
                  <p><strong>Plan:</strong> {membershipData.nombre_plan || 'Plan Estándar'}</p>
                  <p><strong>Tipo:</strong> {membershipData.tipo_plan ? (
                    membershipData.tipo_plan.charAt(0).toUpperCase() + membershipData.tipo_plan.slice(1)
                  ) : 'Mensual'}</p>
                  <p><strong>Fecha de inicio:</strong> {formatDate(membershipData.fecha_inicio)}</p>
                  <p><strong>Fecha de vencimiento:</strong> {formatDate(membershipData.fecha_fin)}</p>
                  <p><strong>Precio pagado:</strong> ${membershipData.precio_pagado || membershipData.precio} MXN</p>
                </div>
                
                <div className="membership-benefits">
                  <h4>Beneficios incluidos:</h4>
                  <ul>
                    <li>Acceso ilimitado al gimnasio</li>
                    <li>Área de cardio y pesas</li>
                    <li>Acceso a vestidores</li>
                    {membershipData.nombre_plan === 'Plan Premium' && (
                      <>
                        <li>Asesoría personalizada</li>
                        <li>Clases grupales ilimitadas</li>
                      </>
                    )}
                    {membershipData.nombre_plan === 'Plan Básico' && (
                      <li>2 clases grupales gratuitas por semana</li>
                    )}
                  </ul>
                </div>
                
                <div className="renewal-info">
                  <p>Para renovar tu membresía, por favor acude a la recepción del gimnasio.</p>
                </div>
              </div>
            ) : (
              <div className="membership-card inactive">
                <div className="membership-header">
                  <h3>Sin Membresía Activa</h3>
                  <span className="membership-status inactive">Inactiva</span>
                </div>
                
                <div className="membership-details-expanded">
                  <p>Actualmente no tienes una membresía activa. Para adquirir una membresía, por favor acude a la recepción del gimnasio.</p>
                </div>
              </div>
            )}
            
            <div className="information-section">
              <h3>Información de Planes Disponibles</h3>
              <p>En FitnessGym ofrecemos diferentes planes adaptados a tus necesidades. Visítanos para obtener más información y adquirir el plan que mejor se adapte a ti.</p>
              
              {availablePlans.length > 0 ? (
                <div className="plan-info-cards">
                  {availablePlans.map(plan => (
                    <div key={plan.id_plan} className="plan-info-card">
                      <h4>{plan.nombre}</h4>
                      <p className="plan-description">{plan.descripcion || 'Plan de membresía para el gimnasio'}</p>
                      <p className="plan-price-info">Desde ${plan.precio} MXN</p>
                      <p className="plan-period-info">Disponible en modalidad mensual, trimestral y anual</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Comunícate con nosotros para conocer nuestros planes actuales.</p>
              )}
              
              <div className="contact-info">
                <h4>¿Necesitas más información?</h4>
                <p>Visítanos en nuestras instalaciones o llámanos al: <strong>(123) 456-7890</strong></p>
                <p>Horario de atención: Lunes a Viernes de 7:00 AM a 10:00 PM, Sábados y Domingos de 8:00 AM a 8:00 PM</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Membresia;