// public/product-render.js

document.addEventListener('DOMContentLoaded', () => {
    // Obtenemos la categoría de la URL de la página (ej: 'usados-gpus')
    const currentPath = window.location.pathname;
    const categoryMatch = currentPath.match(/\/(\w+-\w+)\.html$/);
    
    // Si la URL coincide con un patrón de categoría, cargamos los productos
    if (categoryMatch) {
        const currentCategory = categoryMatch[1];
        loadAndRenderProducts(currentCategory);
    }
});

/**
 * Carga los productos desde la API y los filtra por la categoría actual.
 * @param {string} filterCategory - La categoría a mostrar.
 */
async function loadAndRenderProducts(filterCategory) {
    const listContainer = document.querySelector('.product-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<h2>Cargando productos...</h2>';

    try {
        // Llama a tu API de productos
        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error al conectar con la API.');
        
        const products = await response.json();
        
        // Filtrar productos por la categoría de la página actual
        const filteredProducts = products.filter(p => p.categoria === filterCategory);
        
        listContainer.innerHTML = ''; // Limpiar mensaje de carga

        if (filteredProducts.length === 0) {
            listContainer.innerHTML = `<h2 class="no-products">No hay ${filterCategory.replace('-', ' ').toUpperCase()} disponibles en este momento.</h2>`;
            return;
        }

        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            // Importante: Usamos el placeholder que guardamos en la DB (placeholder-imagen-subida.jpg)
            const imageUrl = `/images/productos/${product.imagenUrl}`; 

            card.innerHTML = `
                <img src="${imageUrl}" alt="${product.nombre}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.nombre}</h3>
                    <p class="product-description">${product.descripcion}</p>
                    <p class="product-category">${product.categoria.includes('usados') ? 'Usado' : 'Nuevo'}</p>
                    <div class="price-container">
                        <span class="product-price">${formatearPrecio(product.precio)}</span>
                    </div>
                    <button class="add-to-cart-btn" data-id="${product._id}">Agregar al Carrito</button>
                </div>
            `;
            listContainer.appendChild(card);

            // Reasignar el evento del carrito (asumiendo que formatearPrecio existe en script.js)
            card.querySelector('.add-to-cart-btn').addEventListener('click', agregarProducto);
        });

    } catch (error) {
        listContainer.innerHTML = '<h2 class="error-products">Error al cargar la tienda. Intente más tarde.</h2>';
        console.error("Error al renderizar tienda:", error);
    }
}