document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const formCita = document.getElementById('form-cita');
    const listaCitas = document.getElementById('lista-citas');
    const inputBusqueda = document.getElementById('busqueda');
    const selectEstado = document.getElementById('filtro-estado');
    const modalCita = document.getElementById('modal-cita');
    const btnNuevaCita = document.getElementById('btn-nueva-cita');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');

    const inputMascota = document.getElementById('mascota');
    const inputPropietario = document.getElementById('propietario');
    const inputTelefono = document.getElementById('telefono');
    const inputFecha = document.getElementById('fecha');
    const inputHora = document.getElementById('hora');
    const inputTipo = document.getElementById('tipo');
    const inputSintomas = document.getElementById('sintomas');
    const inputId = document.getElementById('id-cita');

    const modalConfirmar = document.getElementById('modal-confirmar');
    const btnConfirmarEliminar = document.getElementById('confirmar-eliminar');
    const btnCancelarEliminar = document.getElementById('cancelar-eliminar');

    let citas = JSON.parse(localStorage.getItem('citas')) || [];
    let idAEliminar = null;

    // Funciones utilitarias
    function guardarLocalStorage() {
        localStorage.setItem('citas', JSON.stringify(citas));
    }

    function generarId() {
        return Date.now();
    }

    function abrirModal(titulo) {
        if (!titulo) titulo = "Nueva Cita";
        document.getElementById("modal-titulo").textContent = titulo;
        modalCita.classList.remove("oculto");
    }

    function cerrarModal() {
        modalCita.classList.add("oculto");
    }

    function limpiarFormulario() {
        formCita.reset();
        inputId.value = "";
    }

    function renderCitas() {
        listaCitas.innerHTML = "";
        const termino = inputBusqueda.value.trim().toLowerCase();
        const estadoSeleccionado = selectEstado.value;

        const citasFiltradas = citas.filter(function (cita) {
            const coincideBusqueda =
                cita.mascota.toLowerCase().includes(termino) ||
                cita.propietario.toLowerCase().includes(termino);
            const coincideEstado = estadoSeleccionado === "Todas" || cita.estado === estadoSeleccionado;
            return coincideBusqueda && coincideEstado;
        });

        if (citasFiltradas.length === 0) {
            listaCitas.innerHTML = "<p>No hay citas que coincidan.</p>";
            return;
        }

        citasFiltradas.forEach(function (cita) {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <h3>${cita.mascota} (${cita.tipo})</h3>
                <p><strong>Propietario:</strong> ${cita.propietario}</p>
                <p><strong>Teléfono:</strong> ${cita.telefono}</p>
                <p><strong>Fecha:</strong> ${cita.fecha} ${cita.hora}</p>
                <p><strong>Síntomas:</strong> ${cita.sintomas}</p>
                <p><strong>Estado:</strong> ${cita.estado}</p>
                <div class="acciones-card">
                    <button onclick="editarCita(${cita.id})">Editar</button>
                    <button onclick="confirmarEliminar(${cita.id})">Eliminar</button>
                    <button onclick="completada(${cita.id})">Completada</button>
                    <button onclick="anular(${cita.id})">Anular</button>
                </div>
            `;
            listaCitas.appendChild(card);
        });
    }

    function guardarCita() {
        const nuevaCita = {
            id: inputId.value ? parseInt(inputId.value) : generarId(),
            mascota: inputMascota.value.trim(),
            propietario: inputPropietario.value.trim(),
            telefono: inputTelefono.value.trim(),
            fecha: inputFecha.value,
            hora: inputHora.value,
            tipo: inputTipo.value,
            sintomas: inputSintomas.value.trim(),
            estado: "Abierta"
        };

        const indice = citas.findIndex(function (cita) {
            return cita.id === nuevaCita.id;
        });

        if (indice >= 0) {
            citas[indice] = nuevaCita;
        } else {
            citas.push(nuevaCita);
        }

        guardarLocalStorage();
        renderCitas();
        cerrarModal();
    }

    window.editarCita = function (id) {
        const cita = citas.find(function (c) {
            return c.id === id;
        });
        if (!cita) return;

        inputId.value = cita.id;
        inputMascota.value = cita.mascota;
        inputPropietario.value = cita.propietario;
        inputTelefono.value = cita.telefono;
        inputFecha.value = cita.fecha;
        inputHora.value = cita.hora;
        inputTipo.value = cita.tipo;
        inputSintomas.value = cita.sintomas;

        abrirModal("Editar Cita");
    };

    window.confirmarEliminar = function (id) {
        idAEliminar = id;
        modalConfirmar.classList.remove("oculto");
    };

    window.completada = function (id) {
        const cita = citas.find(c => c.id === id);
        if (!cita) return;
        cita.estado = "Terminada";
        guardarLocalStorage();
        renderCitas();
    };

    window.anular = function (id) {
        const cita = citas.find(c => c.id === id);
        if (!cita) return;
        cita.estado = "Anulada";
        guardarLocalStorage();
        renderCitas();
    };


    function eliminarCita() {
        if (idAEliminar !== null) {
            citas = citas.filter(function (c) {
                return c.id !== idAEliminar;
            });
            guardarLocalStorage();
            renderCitas();
            idAEliminar = null;
        }
        modalConfirmar.classList.add("oculto");
    }

    function cancelarEliminacion() {
        idAEliminar = null;
        modalConfirmar.classList.add("oculto");
    }

    // Eventos
    btnNuevaCita.addEventListener("click", function () {
        limpiarFormulario();
        abrirModal("Nueva Cita");
    });

    btnCerrarModal.addEventListener("click", cerrarModal);
    inputBusqueda.addEventListener("input", renderCitas);
    selectEstado.addEventListener("change", renderCitas);
    formCita.addEventListener("submit", function (e) {
        e.preventDefault();
        guardarCita();
    });
    btnConfirmarEliminar.addEventListener("click", eliminarCita);
    btnCancelarEliminar.addEventListener("click", cancelarEliminacion);

    // Inicializar
    renderCitas();
});