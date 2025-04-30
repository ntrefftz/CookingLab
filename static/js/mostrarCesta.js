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
            <p>Cantidad: ${ingrediente.cantidad}</p>
            <p>Precio: ${ingrediente.precio} €</p>
            <form><button class="aumentar-cantidad" data-id="${ingrediente.id}">Añadir</button></form>
            <form><button class="eliminar-ingrediente" data-id="${ingrediente.id}">Eliminar</button></form>
        `;
        cestaContainer.appendChild(div);

        // Agregar evento al botón "Añadir"
        const aumentarBtn = div.querySelector('.aumentar-cantidad');
        aumentarBtn.addEventListener('click', function() {
            const id = this.dataset.id;

            fetch('/pedidos/cesta/aumentar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            })
            .then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    console.error('Error al aumentar la cantidad del ingrediente');
                }
            })
            .catch(error => console.error('Error:', error));
        });

        // Agregar evento al botón "Eliminar"
        const eliminarBtn = div.querySelector('.eliminar-ingrediente');
        eliminarBtn.addEventListener('click', function() {
            const id = this.dataset.id;

            fetch('/pedidos/cesta/eliminar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            })
            .then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    console.error('Error al eliminar el ingrediente');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });

    const total = document.createElement('div');
    total.className = 'total';
    total.innerHTML = `
        <h3>Total: ${precioTotal.toFixed(2)} €</h3>
    `;
    const botonFinalizar = document.createElement('button');
    botonFinalizar.className = 'tramitar';
    botonFinalizar.innerHTML = 'Tramitar pedido';
    total.appendChild(botonFinalizar);

    // Agregar evento al botón "Tramitar pedido"
    botonFinalizar.addEventListener('click', function() {
        fetch('/pedidos/tramitarPedido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.pedidoId) {
                window.location.href = `/pedidos/confirmarPedido?id=${data.pedidoId}`;
            } else if (data.error) {
                console.error('Error al tramitar el pedido:', data.error);
                alert('No se pudo tramitar el pedido: ' + data.error);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    cestaContainer.appendChild(total);
});