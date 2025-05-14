function menu(session){

	if (session == null || ! session.login){
		return `<li><a href="/usuarios/login">Login</a></li>
				<li><a href="/usuarios/register">Registro</a></li>`;
	}
	
	return `<li><a href="/usuarios/configuracion">Configuración</a></li>
			<li><a href="/usuarios/logout">Cerrar sesión</a></li>`;
}
function mostrarSaludo(session){
	if (session == null || ! session.login){
		return `<p>Usuario desconocido. &rarr;</p>`;
	}

	return `<p>Bienvenido ${session.nombre}.</a></p>`;
}
document.addEventListener('DOMContentLoaded', () => {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const menuList = document.getElementById('menu');
    const saludo = document.getElementById('saludo');

    const sessionData = document.getElementById('sessionData');
    const session = JSON.parse(sessionData.textContent);

    saludo.innerHTML = mostrarSaludo(session);
    menuList.innerHTML = menu(session);

    dropdownButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Evita que el clic se propague al documento
        dropdownMenu.classList.toggle('show'); // Alterna la clase 'show'
    });

    // Cierra el menú si se hace clic fuera de él
    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
    });
});
