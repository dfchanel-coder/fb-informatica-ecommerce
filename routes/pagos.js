// routes/pagos.js

const express = require('express');
const router = express.Router();

// 1. Importar el objeto principal del SDK
const mercadopago = require('mercadopago'); 

const Orden = require('../models/Orden'); 

// 2. CORRECCIÓN FINAL: Usamos el método estático configure para inicializar el SDK.
// Esto evita los errores de constructor que hemos visto.
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN 
});

// RUTA: CREAR PREFERENCIA DE PAGO (POST /api/pagos/crear-preferencia)
router.post('/crear-preferencia', async (req, res) => {
    // Los datos del cuerpo de la petición (req.body) vienen del script de checkout
    const { clienteData, items, totales } = req.body;

    // --- 1. Guardar la Orden como Pendiente en la BD ---
    let nuevaOrden;
    try {
        nuevaOrden = new Orden({
            nombreCliente: clienteData.nombre,
            email: clienteData.email,
            telefono: clienteData.telefono,
            direccion: clienteData.direccion,
            ciudad: clienteData.ciudad,
            items: items.map(item => ({
                productoId: item.id,
                nombre: item.nombre,
                precioUnitario: item.precio,
                cantidad: item.cantidad
            })),
            subtotal: totales.subtotal,
            costoEnvio: totales.costoEnvio,
            total: totales.total,
            metodoPago: 'mercadopago',
            estado: 'pendiente' // Estado inicial antes del pago
        });
        await nuevaOrden.save();
    } catch (error) {
        console.error("Error al guardar la orden en DB:", error);
        return res.status(500).json({ error: "No se pudo guardar la orden para procesar el pago." });
    }
    
    // --- 2. Crear la Preferencia de Pago para Mercado Pago ---
    
    // Mapear los ítems del carrito al formato que espera Mercado Pago
    const mpItems = items.map(item => ({
        title: item.nombre,
        unit_price: item.precio,
        quantity: item.cantidad,
        currency_id: "UYU" // Asegúrate de que esta moneda sea correcta para tu cuenta
    }));

    // Añadir el costo de envío como un ítem de servicio
    if (totales.costoEnvio > 0) {
        mpItems.push({
            title: "Costo de Envío",
            unit_price: totales.costoEnvio,
            quantity: 1,
            currency_id: "UYU"
        });
    }

    let preference = {
        items: mpItems,
        // URL a donde regresa el cliente después de pagar o cancelar
        back_urls: {
            success: `http://localhost:3000/pago-resultado.html?status=success&order_id=${nuevaOrden._id}`,
            failure: `http://localhost:3000/pago-resultado.html?status=failure&order_id=${nuevaOrden._id}`,
            pending: `http://localhost:3000/pago-resultado.html?status=pending&order_id=${nuevaOrden._id}`
        },
        auto_return: "approved", 
        external_reference: nuevaOrden._id.toString(), 
        // URL para recibir notificaciones (Webhook), necesaria si despliegas a Railway
        // notification_url: `https://[TU_DOMINIO_PUBLICO]/api/pagos/webhook` 
    };

    try {
        // Usamos el método estático preferences.create
        const response = await mercadopago.preferences.create(preference);
        
        // 3. Devolver la URL de pago al cliente
        res.status(200).json({ 
            id: response.body.id,
            init_point: response.body.init_point 
        });

    } catch (error) {
        console.error("Error al crear la preferencia de MP:", error);
        res.status(500).json({ error: "Error al procesar el pago con Mercado Pago." });
    }
});

module.exports = router;