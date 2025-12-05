// routes/ordenes.js

const express = require('express');
const router = express.Router();
const Orden = require('../models/Orden'); // Importamos el Modelo

// RUTA 1: CREAR UNA NUEVA ORDEN (POST /api/ordenes) - Usada por el Checkout del cliente
router.post('/', async (req, res) => {
    try {
        const nuevaOrden = new Orden(req.body); // El cuerpo de la petición (req.body) contiene todos los datos de la orden
        const ordenGuardada = await nuevaOrden.save();
        res.status(201).json(ordenGuardada);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la orden.", error: error.message });
    }
});

// RUTA 2: OBTENER TODAS LAS ÓRDENES (GET /api/ordenes) - Usada por el Admin
router.get('/', async (req, res) => {
    try {
        // Busca todas las órdenes, ordenadas por fecha de forma descendente (-1)
        const ordenes = await Orden.find().sort({ fechaPedido: -1 }); 
        res.status(200).json(ordenes);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las órdenes." });
    }
});

// RUTA 3: ACTUALIZAR ESTADO DE LA ORDEN (PUT /api/ordenes/:id) - Usada por el Admin
router.put('/:id', async (req, res) => {
    try {
        const ordenActualizada = await Orden.findByIdAndUpdate(
            req.params.id, 
            { estado: req.body.estado }, // Solo permitimos actualizar el campo 'estado'
            { new: true } // {new: true} retorna el documento actualizado
        );

        if (!ordenActualizada) {
            return res.status(404).json({ message: "Orden no encontrada." });
        }
        
        res.status(200).json(ordenActualizada);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la orden." });
    }
});

// RUTA 4: ELIMINAR UNA ORDEN (DELETE /api/ordenes/:id) - Usada por el Admin
router.delete('/:id', async (req, res) => {
    try {
        await Orden.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Orden eliminada correctamente." });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la orden." });
    }
});


module.exports = router;