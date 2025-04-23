document.addEventListener('DOMContentLoaded', function() {
    // Obtiene los datos del elemento HTML
    const cestaData = document.getElementById('cesta-data');
    const precio = parseFloat(cestaData.dataset.precio);
    const ingredientes = JSON.parse(cestaData.dataset.ingredientes);
    
    // Limpia el contenedor
    const cestaContainer = document.getElementById('cesta');
    cestaContainer.innerHTML = '';
    
    // Tu función original con pequeñas mejoras
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
        <h3>Total: ${precio} €</h3>
    `;
    cestaContainer.appendChild(total);
    
    // Añade event listeners para los botones de eliminar
    document.querySelectorAll('.eliminar-ingrediente').forEach(button => {
        button.addEventListener('click', function() {
            const ingredienteId = this.dataset.id;
            // Aquí puedes añadir la lógica para eliminar el ingrediente
            console.log('Eliminar ingrediente:', ingredienteId);
        });
    });
});