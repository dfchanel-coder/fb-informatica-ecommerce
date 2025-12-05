// routes/productos.js

const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto'); // Importamos el Modelo
const path = require('path');
const multer = require('multer'); // Para manejar la subida de archivos

// --- Configuración de Multer (Subida de Imagen) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Asegúrate de que esta carpeta exista: public/images/productos
        cb(null, 'public/images/productos'); 
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
        // 1. Crear la URL de la imagen que se guardó
        const imagenUrl = `/images/productos/${req.file.filename}`;
        
        // 2. Crear un nuevo objeto Producto con los datos del formulario y la URL
        const nuevoProducto = new Producto({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            categoria: req.body.categoria,
            imagenUrl: imagenUrl // Usamos la URL que creamos
        });

        // 3. Guardar en la Base de Datos
        const productoGuardado = await nuevoProducto.save();
        
        // 4. Respuesta exitosa
        res.status(201).json(productoGuardado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el producto.", error: error.message });
    }
});

// RUTA 2: OBTENER TODOS LOS PRODUCTOS (GET /api/productos)
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find().sort({ fechaCreacion: -1 }); // Busca todos, ordenados por fecha
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