const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');

// Middleware
const app = express();
// Actualiza esto en server/server.js
app.use(cors({
    origin: '*', // Permite cualquier origen durante desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json());

// Conexión a la base de datos
connectDB()
  .then(() => console.log('Conectado a la base de datos SQL Server'))
  .catch(err => console.error('Error conectando a la BD:', err));

// Rutas básicas para pruebas
app.get('/', (req, res) => {
  res.send('API del Sistema de Gimnasio funcionando');
});

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});