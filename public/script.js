// ==========================================================
// LOGICA DEL CARRITO DE COMPRAS ACTUALIZADA
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    cargarCarritoDesdeLocalStorage();
    
    // Asignar evento a los botones "Agregar al Carrito" solo si estamos en una página de productos
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', agregarProducto);
    });

    // Renderizar el carrito si estamos en la página de carrito
    if (document.getElementById('cart-items-container')) {
        renderizarCarrito();
    }
    
    // Enlazar el botón del encabezado a la página del carrito
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = 'carrito.html';
        });
    }
});

let carrito = [];

// --- Funciones de Almacenamiento ---

function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carritoFBInformatica');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarContadorCarrito();
    }
}

function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carritoFBInformatica', JSON.stringify(carrito));
    actualizarContadorCarrito();
    // Vuelve a renderizar si estamos en la página del carrito
    if (document.getElementById('cart-items-container')) {
        renderizarCarrito();
    }
}

function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.innerHTML = `🛒 Carrito (${totalItems})`;
    }
}

// --- Lógica de Producto y Carrito ---

function agregarProducto(event) {
    const card = event.target.closest('.product-card');
    if (!card) return;

    // 1. Extraer datos del producto
    const nombre = card.querySelector('.product-name').textContent;
    const precioTexto = card.querySelector('.product-price').textContent.replace('$', '').replace('.', '').trim();
    const precio = parseFloat(precioTexto);
    const id = nombre.replace(/\s/g, '').toLowerCase(); 

    const nuevoProducto = { id, nombre, precio, cantidad: 1 };

    // 2. Verificar si el producto ya existe
    const existe = carrito.find(item => item.id === id);

    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push(nuevoProducto);
    }

    guardarCarritoEnLocalStorage();
    alert(`"${nombre}" añadido al carrito.`);
}

function formatearPrecio(precio) {
    // Formatea el número a formato de moneda con separador de miles y sin decimales
    return `$ ${precio.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function calcularTotales() {
    const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    // Establecemos un costo de envío fijo de ejemplo (ej. $5000) o gratis si es > $500.000
    const COSTO_ENVIO = subtotal > 500000 ? 0 : 5000;
    const total = subtotal + COSTO_ENVIO;

    // Actualiza el resumen
    document.getElementById('cart-subtotal').textContent = formatearPrecio(subtotal);
    document.getElementById('shipping-cost').textContent = COSTO_ENVIO === 0 ? '¡Gratis!' : formatearPrecio(COSTO_ENVIO);
    document.getElementById('cart-total').textContent = formatearPrecio(total);
}

function renderizarCarrito() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = ''; // Limpiar el contenido anterior

    if (carrito.length === 0) {
        container.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
        // Deshabilita el botón de checkout
        document.getElementById('checkout-link').style.pointerEvents = 'none';
        document.getElementById('checkout-link').style.opacity = '0.5';
        document.getElementById('cart-subtotal').textContent = formatearPrecio(0);
        document.getElementById('shipping-cost').textContent = 'A calcular';
        document.getElementById('cart-total').textContent = formatearPrecio(0);
        return;
    }
    
    // Habilita el botón de checkout si hay ítems
    document.getElementById('checkout-link').style.pointerEvents = 'auto';
    document.getElementById('checkout-link').style.opacity = '1';

    carrito.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        
        cartItemDiv.innerHTML = `
            <img src="placeholder-gpu.jpg" alt="${item.nombre}" class="item-image">
            <div class="item-details">
                <h4>${item.nombre}</h4>
                <p>Precio Unitario: ${formatearPrecio(item.precio)}</p>
            </div>
            <div class="item-quantity-control">
                <button class="quantity-btn decrement" data-id="${item.id}">-</button>
                <span class="item-quantity">${item.cantidad}</span>
                <button class="quantity-btn increment" data-id="${item.id}">+</button>
            </div>
            <span class="item-total-price">${formatearPrecio(itemTotal)}</span>
            <button class="remove-item-btn" data-id="${item.id}">×</button>
        `;
        container.appendChild(cartItemDiv);
    });

    // Asignar eventos a los botones de control y eliminación
    container.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', eliminarProducto);
    });
    container.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', manejarCantidad);
    });

    calcularTotales();
}

function eliminarProducto(event) {
    const id = event.target.dataset.id;
    carrito = carrito.filter(item => item.id !== id);
    guardarCarritoEnLocalStorage();
}

function manejarCantidad(event) {
    const id = event.target.dataset.id;
    const item = carrito.find(i => i.id === id);
    if (!item) return;

    if (event.target.classList.contains('increment')) {
        item.cantidad += 1;
    } else if (event.target.classList.contains('decrement')) {
        item.cantidad -= 1;
    }

    if (item.cantidad < 1) {
        // Si la cantidad llega a cero, eliminar el producto
        eliminarProducto({ target: { dataset: { id: id } } });
    } else {
        guardarCarritoEnLocalStorage();
    }
}