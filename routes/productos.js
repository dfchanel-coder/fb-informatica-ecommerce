// routes/productos.js

const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto'); 
const path = require('path');
const multer = require('multer'); 
const fs = require('fs'); 

// --- Configuración de Multer (Subida de Imagen - CORRECCIÓN PARA RENDER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // CORRECCIÓN: Usar el directorio temporal del sistema que tiene permisos de escritura.
        const uploadDir = '/tmp/uploads'; 
        
        // Creamos el directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // Renombra el archivo: categoria-timestamp.extension
        const extension = path.extname(file.originalname);
        cb(null, `${req.body.categoria}-${Date.now()}${extension}`);
    }
});
const upload = multer({ storage: storage });

// RUTA 1: CREAR UN NUEVO PRODUCTO (POST /api/productos)
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Debe adjuntar un archivo de imagen." });
        }
        
        // VALIDACIÓN DE DATOS CLAVE
        const precioNumero = parseFloat(req.body.precio);
        
        if (isNaN(precioNumero) || precioNumero <= 0) {
            return res.status(400).json({ message: "El precio debe ser un número válido y positivo (sin comas ni signos de moneda)." });
        }
        
        // ADVERTENCIA: La imagen en /tmp se borra, por eso usamos un placeholder.
        const placeholderUrl = "placeholder-imagen-subida.jpg"; 

        // 2. Crear un nuevo objeto Producto
        const nuevoProducto = new Producto({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            // Usamos el valor numérico validado:
            precio: precioNumero, 
            categoria: req.body.categoria,
            imagenUrl: placeholderUrl 
        });

        // 3. Guardar en la Base de Datos
        const productoGuardado = await nuevoProducto.save();
        
        // 4. Respuesta exitosa
        res.status(201).json(productoGuardado);
    } catch (error) {
        // Manejamos errores de Mongoose y validaciones.
        console.error("Error detallado al crear el producto:", error);
        
        res.status(500).json({ 
            message: "Error de validación: Verifique que todos los campos requeridos estén llenos.", 
            details: error.message 
        });
    }
});

// RUTA 2: OBTENER TODOS LOS PRODUCTOS (GET /api/productos)
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find().sort({ fechaCreacion: -1 }); 
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos." });
    }
});

// RUTA 3: ELIMINAR UN PRODUCTO (DELETE /api/productos/:id)
router.delete('/:id', async (req, res) => {
    try {
        await Producto.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Producto eliminado correctamente." });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el producto." });
    }
});


module.exports = router;