document.addEventListener('DOMContentLoaded', () => {
    // Reutilizamos funciones del script.js (asumiendo que está cargado)
    const total = calcularTotalesCheckout(); 
    renderizarResumenCheckout(total);
    
    // 1. Lógica del Botón de Confirmación
    const form = document.getElementById('shipping-form');
    const confirmBtn = document.getElementById('confirm-order-btn');

    function checkFormValidity() {
        const isFormValid = form.checkValidity();
        confirmBtn.disabled = !isFormValid;
    }

    // Comprobamos la validez cada vez que se cambia un campo
    form.addEventListener('input', checkFormValidity);
    checkFormValidity(); // Comprueba al cargar la página

    // 2. Lógica del botón al confirmar (Simulación)
    confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const metodoPago = document.querySelector('input[name="payment-method"]:checked').value;
        
        // Aquí iría el envío real de datos al servidor.
        
        alert(`¡Pedido Confirmado! Total: ${document.getElementById('checkout-total').textContent}.
Método de pago seleccionado: ${metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Transferencia Bancaria'}.
Recibirá un correo con los detalles.`);
        
        // Limpiar carrito y redirigir
        // localStorage.removeItem('carritoFBInformatica');
        // window.location.href = 'gracias.html'; 
    });
});

/**
 * Función que replica el cálculo de totales del script.js para el checkout.
 * (Idealmente, estas funciones se pondrían en un archivo 'utilidades.js')
 */
function calcularTotalesCheckout() {
    const carritoGuardado = localStorage.getItem('carritoFBInformatica');
    const carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    
    const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    const COSTO_ENVIO = subtotal > 500000 ? 0 : 5000;
    const total = subtotal + COSTO_ENVIO;

    return { subtotal, COSTO_ENVIO, total, carrito };
}

/**
 * Muestra el resumen de los productos en el sidebar del checkout.
 */
function renderizarResumenCheckout({ subtotal, COSTO_ENVIO, total, carrito }) {
    const listContainer = document.getElementById('checkout-summary-list');
    listContainer.innerHTML = '';
    
    if (carrito.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center;">El carrito está vacío. <a href="index.html">Volver a la tienda.</a></p>';
    } else {
        carrito.forEach(item => {
            const itemTotal = item.precio * item.cantidad;
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item-summary-line');
            itemDiv.innerHTML = `
                <span class="item-name">${item.nombre} (x${item.cantidad})</span>
                <span class="item-price">${formatearPrecio(itemTotal)}</span>
            `;
            listContainer.appendChild(itemDiv);
        });
    }
    
    // Aseguramos que formatearPrecio esté disponible (viene de script.js)
    if (typeof formatearPrecio !== 'function') {
        const tempFormatearPrecio = (precio) => `$ ${precio.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
        document.getElementById('checkout-subtotal').textContent = tempFormatearPrecio(subtotal);
        document.getElementById('checkout-shipping-cost').textContent = COSTO_ENVIO === 0 ? '¡Gratis!' : tempFormatearPrecio(COSTO_ENVIO);
        document.getElementById('checkout-total').textContent = tempFormatearPrecio(total);
    } else {
        document.getElementById('checkout-subtotal').textContent = formatearPrecio(subtotal);
        document.getElementById('checkout-shipping-cost').textContent = COSTO_ENVIO === 0 ? '¡Gratis!' : formatearPrecio(COSTO_ENVIO);
        document.getElementById('checkout-total').textContent = formatearPrecio(total);
    }
}