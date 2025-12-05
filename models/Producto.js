// models/Producto.js

const mongoose = require('mongoose');

// Definimos la "receta" (Schema) para un Producto
const ProductoSchema = new mongoose.Schema({
    // Campo: nombre (ej: "RTX 3070")
    nombre: {
        type: String, // Tipo de dato: Texto
        required: true, // Es obligatorio que tenga este campo
        trim: true // Elimina espacios en blanco al inicio/final
    },
    // Campo: descripcion
    descripcion: {
        type: String,
        required: true
    },
    // Campo: precio (ej: 450000)
    precio: {
        type: Number, // Tipo de dato: Número
        required: true
    },
    // Campo: categoria (ej: "usados-gpus")
    categoria: {
        type: String,
        required: true,
        enum: ['usados-gpus', 'usados-pcs', 'nuevos-gpus', 'nuevos-pcs'] // Solo acepta estos valores
    },
    // Campo: imagenUrl (Ruta donde guardamos la imagen, ej: /images/productos/gpu-12345.jpg)
    imagenUrl: {
        type: String,
        required: true
    },
    // Campo: fechaCreacion
    fechaCreacion: {
        type: Date,
        default: Date.now // Asigna la fecha actual por defecto al crearse
    }
});

// Exportamos el Modelo para poder usarlo en otras partes del servidor
module.exports = mongoose.model('Producto', ProductoSchema);