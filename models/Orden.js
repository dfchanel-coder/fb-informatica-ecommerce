// models/Orden.js

const mongoose = require('mongoose');

// Definimos la "receta" (Schema) para un ÍTEM DENTRO DE LA ORDEN
const ItemOrdenSchema = new mongoose.Schema({
    productoId: {
        type: mongoose.Schema.Types.ObjectId, // Referencia al ID del Producto
        required: true
    },
    nombre: String,
    precioUnitario: Number,
    cantidad: Number
});


// Definimos la "receta" (Schema) para la ORDEN COMPLETA
const OrdenSchema = new mongoose.Schema({
    // Datos del Cliente (Formulario de Checkout)
    nombreCliente: { type: String, required: true },
    email: { type: String, required: true },
    telefono: String,
    direccion: String,
    ciudad: String,
    
    // Lista de ítems
    items: [ItemOrdenSchema], // Array de ítems usando el esquema anterior
    
    // Totales
    subtotal: { type: Number, required: true },
    costoEnvio: { type: Number, default: 0 },
    total: { type: Number, required: true },
    
    // Gestión del Pago
    metodoPago: { type: String, required: true, enum: ['mercadopago', 'transferencia'] },
    
    // Estado de la Orden (Lo que gestionarás desde el Admin)
    estado: {
        type: String,
        enum: ['pendiente', 'finalizada', 'cancelada'],
        default: 'pendiente'
    },

    // Fecha
    fechaPedido: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Orden', OrdenSchema);