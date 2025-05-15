const express = require('express');
const productionRoutes = require('./routes/productionRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

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
app.use('/prod', productionRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Productions Service corriendo en http://0.0.0.0:${PORT}`);
});