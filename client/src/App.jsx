import React, { useState, useEffect } from 'react';
import api from './services/api';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('Verificando conexión...');

  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const response = await api.testConnection();
        setConnectionStatus('Conexión exitosa: ' + response);
      } catch (error) {
        setConnectionStatus('Error de conexión: ' + error.message);
      }
    };

    testBackendConnection();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de Gimnasio</h1>
        <p>Estado de la conexión: {connectionStatus}</p>
      </header>
    </div>
  );
}

export default App;