const express = require('express');
const router = express.Router();
const multer = require('multer'); // Librería para subir imágenes
const path = require('path');
const fs = require('fs');

// 1. Configuración de Multer (Dónde se guardan las imágenes)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Carpeta donde se guardarán las fotos
        const dir = 'public/uploads/'; 
        // Si la carpeta no existe, la crea
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Nombre único: fecha + nombre original
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// IMPORTANTE: Si ya tienes tu modelo de Mongoose, descomenta esta línea:
// const Producto = require('../models/Producto'); 

// ==========================================
// RUTAS DE LA API (BACKEND)
// ==========================================

// GET: Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        // SI TIENES BASE DE DATOS:
        // const productos = await Producto.find();
        // res.json(productos);

        // MODO PRUEBA (Para que no falle mientras conectas la DB):
        res.json([
            { _id: 'temp123456789012345678', nombre: 'Producto Demo', precio: 1500, categoria: 'nuevos-gpus' }
        ]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Crear nuevo producto (Sube imagen y datos)
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria } = req.body;
        
        // Si se subió imagen, guardamos la ruta. Si no, string vacío.
        const imagenUrl = req.file ? `/uploads/${req.file.filename}` : '';

        // SI TIENES BASE DE DATOS:
        // const nuevoProducto = new Producto({ 
        //     nombre, 
        //     descripcion, 
        //     precio, 
        //     categoria, 
        //     imagen: imagenUrl 
        // });
        // const productoGuardado = await nuevoProducto.save();
        // res.status(201).json(productoGuardado);

        // RESPUESTA DE PRUEBA:
        console.log('✅ Producto Recibido:', nombre);
        res.status(201).json({ message: 'Producto creado (Simulado)', producto: { nombre, imagenUrl } });

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error al crear producto' });
    }
});

// DELETE: Eliminar producto
router.delete('/:id', async (req, res) => {
    try {
        // SI TIENES BASE DE DATOS:
        // await Producto.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;