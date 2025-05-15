const express = require('express');
const cors = require('cors'); // Importar el paquete cors
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

// Configuración de CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Health Check Endpoint (Agregar esto ANTES de las otras rutas)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'Auth Service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Rutas
app.use('/auth', authRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Auth Service corriendo en http://0.0.0.0:${PORT}`);
});