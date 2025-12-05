// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// 1. Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middleware
app.use(express.json()); // Para manejar JSON en peticiones
app.use(express.urlencoded({ extended: true })); // Para manejar datos de formulario

// 3. Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conexión exitosa a MongoDB'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

// 4. Servir archivos estáticos del Frontend
// Esto sirve tu index.html, styles.css, etc., desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));


// 5. Rutas de la API (Aquí irán las rutas de Productos, Órdenes, Mercado Pago)
app.use('/api/productos', require('./routes/productos'));
app.use('/api/ordenes', require('./routes/ordenes'));
app.use('/api/pagos', require('./routes/pagos'));


// 6. Iniciar el Servidor
app.listen(PORT, () => {
    console.log(`Servidor de FB Informática corriendo en el puerto ${PORT}`);
    console.log(`Accede a la tienda en: http://localhost:${PORT}`);
});