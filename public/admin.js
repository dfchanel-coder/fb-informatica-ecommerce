document.addEventListener('DOMContentLoaded', () => {
    // Inicializar al cargar la página
    cargarProductos();
    cargarOrdenes();

    // 1. Manejar el Formulario de Productos (Subida/Creación)
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);

    // 2. Manejar la Tabla de Órdenes (Actualización de Estado y Eliminación)
    document.getElementById('order-table').addEventListener('change', handleOrderStatusChange);
    document.getElementById('order-table').addEventListener('click', handleOrderActions);
});

// ==========================================================
// 1. LÓGICA DE PRODUCTOS
// ==========================================================

/**
 * Muestra el listado de productos en la tabla del administrador.
 * @param {Array} productos - Lista de productos desde la API.
 */
function renderizarProductos(productos) {
    const tbody = document.getElementById('product-table').querySelector('tbody');
    tbody.innerHTML = ''; // Limpia la tabla

    productos.forEach(p => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${p._id.substring(18)}...</td>
            <td>${p.nombre}</td>
            <td>${formatearPrecio(p.precio)}</td>
            <td>${p.categoria}</td>
            <td>
                <button class="delete-product-btn" data-id="${p._id}">Eliminar</button>
            </td>
        `;
        // Asignamos el evento de eliminar al botón de la fila
        row.querySelector('.delete-product-btn').addEventListener('click', handleDeleteProduct);
    });
}

/**
 * Obtiene todos los productos del servidor y los renderiza.
 */
async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        const productos = await response.json();
        renderizarProductos(productos);
    } catch (error) {
        console.error('Carga de productos fallida:', error);
        alert('No se pudieron cargar los productos. Verifique el servidor.');
    }
}

/**
 * Maneja la subida de un nuevo producto (incluyendo la imagen).
 * @param {Event} e - Evento de envío del formulario.
 */
async function handleProductSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    // FormData se utiliza para enviar datos de formulario que incluyen archivos (imágenes)
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/productos', {
            method: 'POST',
            body: formData // Aquí enviamos el objeto FormData (incluye texto e imagen)
        });

        if (!response.ok) {
            throw new Error('Error al crear el producto. Código: ' + response.status);
        }

        alert('✅ Producto creado y imagen subida con éxito!');
        form.reset(); // Limpiar formulario
        cargarProductos(); // Recargar la lista de productos
    } catch (error) {
        console.error('Subida fallida:', error);
        alert('❌ Error: No se pudo crear el producto. Asegúrese que el servidor Express esté corriendo.');
    }
}

/**
 * Elimina un producto de la base de datos.
 * @param {Event} e - Evento de click en el botón Eliminar.
 */
async function handleDeleteProduct(e) {
    const id = e.target.dataset.id;
    if (!confirm(`¿Estás seguro de eliminar el producto con ID ${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/productos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar producto.');

        alert('🗑️ Producto eliminado correctamente.');
        cargarProductos(); // Recargar la lista
    } catch (error) {
        console.error('Eliminación fallida:', error);
        alert('❌ Error al eliminar el producto.');
    }
}


// ==========================================================
// 2. LÓGICA DE ÓRDENES
// ==========================================================

/**
 * Muestra el listado de órdenes en la tabla del administrador.
 * @param {Array} ordenes - Lista de órdenes desde la API.
 */
function renderizarOrdenes(ordenes) {
    const tbody = document.getElementById('order-table').querySelector('tbody');
    tbody.innerHTML = '';

    ordenes.forEach(orden => {
        const row = tbody.insertRow();
        const estadoOpciones = ['pendiente', 'finalizada', 'cancelada'];
        
        // Crear el selector de estado
        const selectHTML = `
            <select class="order-status-select" data-id="${orden._id}">
                ${estadoOpciones.map(estado => 
                    `<option value="${estado}" ${orden.estado === estado ? 'selected' : ''}>
                        ${estado.toUpperCase()}
                    </option>`
                ).join('')}
            </select>
        `;

        row.innerHTML = `
            <td>#${orden._id.substring(18)}...</td>
            <td>${orden.nombreCliente} (${orden.ciudad})</td>
            <td>${formatearPrecio(orden.total)}</td>
            <td>${selectHTML}</td>
            <td>
                <button class="view-order-btn" data-id="${orden._id}">Ver</button>
                <button class="delete-order-btn" data-id="${orden._id}">Eliminar</button>
            </td>
        `;
    });
}

/**
 * Obtiene todas las órdenes del servidor y las renderiza.
 */
async function cargarOrdenes() {
    try {
        const response = await fetch('/api/ordenes');
        if (!response.ok) throw new Error('Error al cargar órdenes');
        const ordenes = await response.json();
        renderizarOrdenes(ordenes);
    } catch (error) {
        console.error('Carga de órdenes fallida:', error);
    }
}

/**
 * Maneja el cambio en el selector de estado de la orden.
 * @param {Event} e - Evento de cambio en el selector.
 */
async function handleOrderStatusChange(e) {
    if (e.target.classList.contains('order-status-select')) {
        const id = e.target.dataset.id;
        const nuevoEstado = e.target.value;

        try {
            const response = await fetch(`/api/ordenes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) throw new Error('Error al actualizar estado.');
            
            alert(`Estado de la orden #${id.substring(18)}... actualizado a ${nuevoEstado.toUpperCase()}.`);
            // No es necesario recargar toda la tabla
        } catch (error) {
            console.error('Error de actualización:', error);
            alert('❌ No se pudo actualizar el estado de la orden.');
        }
    }
}

/**
 * Maneja el click en los botones de "Ver" o "Eliminar" orden.
 * @param {Event} e - Evento de click.
 */
async function handleOrderActions(e) {
    const target = e.target;
    const id = target.dataset.id;
    
    if (target.classList.contains('delete-order-btn')) {
        if (!confirm(`¿Estás seguro de ELIMINAR la orden #${id.substring(18)}...?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/ordenes/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar orden.');

            alert('🗑️ Orden eliminada correctamente.');
            cargarOrdenes(); // Recargar la lista
        } catch (error) {
            console.error('Eliminación fallida:', error);
            alert('❌ Error al eliminar la orden.');
        }
    } 
    
    if (target.classList.contains('view-order-btn')) {
        // En un proyecto real, se cargaría una modal o una página con los detalles completos.
        alert(`Ver detalles de la Orden #${id.substring(18)}...\nFuncionalidad pendiente: Mostrar cliente, ítems, dirección completa.`);
    }
}


// ==========================================================
// 3. UTILIDADES (Reutilizamos la función de formateo)
// ==========================================================

/**
 * Formatea un número a formato de moneda con separador de miles.
 */
function formatearPrecio(precio) {
    if (typeof precio !== 'number') {
        precio = parseFloat(precio) || 0;
    }
    // Formatea el número a formato de moneda (ej: $ 450.000)
    return `$ ${precio.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}