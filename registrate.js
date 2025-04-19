document.addEventListener("DOMContentLoaded", () => {
    // Arreglo con opciones de clases
    const opcionesClases = [
        { veces: 1, precio: 64000 },
        { veces: 2, precio: 96000 },
        { veces: 3, precio: 120000 }
    ];

    // Función para validar que el nombre y apellido contengan solo letras
    function caracteresValidos(valor) {
        return /^[a-zA-Z\s]+$/.test(valor);
    }

    // Recuperar datos desde localStorage si existen
    const datosGuardados = JSON.parse(localStorage.getItem('inscripcionData'));

    if (datosGuardados) {
        mostrarResumen(datosGuardados);
    } else {
        mostrarFormulario();
    }

    // Función para mostrar el formulario
    function mostrarFormulario() {
        const formularioDiv = document.getElementById("formulario");
        formularioDiv.innerHTML = `
            <form id="inscripcionForm">
                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" required>
                
                <label for="apellido">Apellido:</label>
                <input type="text" id="apellido" required>
                
                <label for="edad">Edad:</label>
                <input type="number" id="edad" required>
                
                <label for="diasClase">¿Cuántos días a la semana deseas tomar clases?</label>
                <select id="diasClase">
                    <option value="1">1 día ($64000)</option>
                    <option value="2">2 días ($96000)</option>
                    <option value="3">3 días ($120000)</option>
                    <option value="personalizada">Personalizada ($50000 por hora)</option>
                </select>
                
                <button type="submit">Enviar</button>
            </form>
        `;

        // Referencias del formulario y el botón
        const form = document.getElementById("inscripcionForm");

        // Evento para manejar la inscripción
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const nombre = document.getElementById("nombre").value;
            const apellido = document.getElementById("apellido").value;
            const edad = parseInt(document.getElementById("edad").value);
            const diasClase = document.getElementById("diasClase").value;

            if (!caracteresValidos(nombre) || !caracteresValidos(apellido)) {
                Swal.fire({
                    icon: 'error',
                    title: '¡Error!',
                    text: 'El nombre y apellido deben contener solo letras.',
                });
                return;
            }

            if (isNaN(edad) || edad <= 0) {
                Swal.fire({
                    icon: 'error',
                    title: '¡Error!',
                    text: 'La edad debe ser un número válido y mayor a 0.',
                });
                return;
            }

            // Definir las clases y precios
            let valorPagar;
            let clasesSeleccionadas;

            if (edad <= 17) {
                clasesSeleccionadas = opcionesClases.find(opcion => opcion.veces.toString() === diasClase);
                valorPagar = clasesSeleccionadas ? clasesSeleccionadas.precio : 0;
            } else {
                clasesSeleccionadas = { veces: "Personalizada", precio: 50000 };
                valorPagar = clasesSeleccionadas.precio;
            }

            // Crear objeto de datos
            const datosInscripcion = {
                nombre,
                apellido,
                edad,
                clasesSeleccionadas,
                valorPagar
            };

            // Guardar los datos en localStorage
            localStorage.setItem('inscripcionData', JSON.stringify(datosInscripcion));

            // Mostrar el resumen
            mostrarResumen(datosInscripcion);
        });
    }

    // Función para mostrar el resumen de los datos
    function mostrarResumen(datos) {
        const formularioDiv = document.getElementById("formulario");
        const resumenDiv = document.getElementById("resumen");

        formularioDiv.style.display = "none";
        resumenDiv.style.display = "block";

        resumenDiv.innerHTML = `
            <h2>Resumen de inscripción:</h2>
            <p><strong>Nombre:</strong> ${datos.nombre}</p>
            <p><strong>Apellido:</strong> ${datos.apellido}</p>
            <p><strong>Edad:</strong> ${datos.edad} años</p>
            <p><strong>Clases:</strong> ${datos.clasesSeleccionadas.veces}</p>
            <p><strong>Valor a pagar:</strong> $${datos.valorPagar}</p>
            <button id="confirmarBtn">Confirmar Inscripción</button>
            <button id="editarBtn">Editar Datos</button>
            <button id="pagoBtn">Acceder al Pago en Línea</button>
        `;

        // Botón de confirmación
        const confirmarBtn = document.getElementById("confirmarBtn");
        confirmarBtn.addEventListener("click", () => {
            Swal.fire({
                icon: 'success',
                title: '¡Gracias!',
                text: 'Te has inscrito correctamente.',
            });
            localStorage.removeItem('inscripcionData');
            location.reload(); // Recargar para mostrar el formulario nuevamente
        });

        // Botón de editar datos
        const editarBtn = document.getElementById("editarBtn");
        editarBtn.addEventListener("click", () => {
            localStorage.removeItem('inscripcionData');
            location.reload();
        });

        // Botón de pago
        const pagoBtn = document.getElementById("pagoBtn");
        pagoBtn.addEventListener("click", async () => {
            try {
                const response = await fetch('https://api.celeriumpatinaje.com/pago', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ valor: datos.valorPagar }),
                });

                if (!response.ok) {
                    throw new Error('Error al procesar el pago');
                }

                const data = await response.json();

                Swal.fire({
                    icon: 'success',
                    title: 'Pago Exitoso',
                    text: `Tu pago de $${data.monto} ha sido procesado correctamente.`,
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                });
            }
        });
    }
});
