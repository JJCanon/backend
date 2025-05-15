const express = require('express');
const cors = require('cors');
const offerRoutes = require('./routes/offerRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');

const app = express();

// Middlewares
app.use(cors());
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
app.use('/api/marketplace', offerRoutes);
app.use('/api/marketplace', purchaseRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3003;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Marketplace Service running on http://0.0.0.0:${PORT}`);
});