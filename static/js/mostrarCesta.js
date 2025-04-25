document.addEventListener('DOMContentLoaded', function() {
    const cestaData = document.getElementById('cesta-data');
    const ingredientes = cestaData ? JSON.parse(cestaData.dataset.ingredientes) : [];
    const precioTotal = cestaData ? parseFloat(cestaData.dataset.precio) : 0;

    const cestaContainer = document.getElementById('cesta');
    cestaContainer.innerHTML = '';

    if (ingredientes.length === 0) {
        const div = document.createElement('div');
        div.className = 'cesta-vacia';
        div.innerHTML = `
            <h2>La cesta está vacía</h2>
            <p>No hay ingredientes en la cesta.</p>
        `;
        cestaContainer.appendChild(div);
        return;
    }

    ingredientes.forEach(ingrediente => {
        const div = document.createElement('div');
        div.className = 'ingrediente';
        div.innerHTML = `
            <h3>${ingrediente.nombre}</h3>
            <p>Precio: ${ingrediente.precio} €</p>
            <button class="eliminar-ingrediente" data-id="${ingrediente.id}">Eliminar</button>
        `;
        cestaContainer.appendChild(div);
    });

    const total = document.createElement('div');
    total.className = 'total';
    total.innerHTML = `
        <h3>Total: ${precioTotal.toFixed(2)} €</h3>
    `;
    cestaContainer.appendChild(total);
});