document.addEventListener('DOMContentLoaded', () => {
    // Elementos principales
    const form = document.getElementById('form-cita');
    const lista = document.getElementById('lista-citas');
    const buscar = document.getElementById('busqueda');
    const filtro = document.getElementById('filtro-estado');
    const modal = document.getElementById('modal-cita');
    const btnNueva = document.getElementById('btn-nueva-cita');
    const btnCerrar = document.getElementById('btn-cerrar-modal');
    const confirmarModal = document.getElementById('modal-confirmar');
    const btnConfirmar = document.getElementById('confirmar-eliminar');
    const btnCancelar = document.getElementById('cancelar-eliminar');

    // Inputs del formulario
    const inputs = {
        id: document.getElementById('id-cita'),
        mascota: document.getElementById('mascota'),
        propietario: document.getElementById('propietario'),
        telefono: document.getElementById('telefono'),
        fecha: document.getElementById('fecha'),
        hora: document.getElementById('hora'),
        tipo: document.getElementById('tipo'),
        sintomas: document.getElementById('sintomas')
    };

    let citas = JSON.parse(localStorage.getItem('citas')) || [];
    let idAEliminar = null;

    // Funciones básicas
    const guardarCitas = () => localStorage.setItem('citas', JSON.stringify(citas));
    const generarId = () => Date.now();

    const limpiarFormulario = () => {
        form.reset();
        inputs.id.value = '';
    };

    const abrirModal = (titulo = 'Nueva Cita') => {
        document.getElementById("modal-titulo").textContent = titulo;
        modal.classList.remove("oculto");
    };

    const cerrarModal = () => modal.classList.add("oculto");

    const esHoraValida = (hora) => {
        const [h, m] = hora.split(':').map(Number);
        const minutos = h * 60 + m;
        return minutos >= 480 && minutos <= 1200;
    };

    const mostrarAviso = (msg, tipo = 'warning') => {
        Swal.fire({
            icon: tipo,
            title: tipo === 'success' ? '¡Éxito!' : 'Aviso',
            text: msg,
            timer: tipo === 'success' ? 2000 : null,
            showConfirmButton: tipo !== 'success',
            toast: tipo === 'success',
            position: tipo === 'success' ? 'top-end' : 'center'
        });
    };

    // Mostrar citas
    const mostrarCitas = () => {
        lista.innerHTML = '';
        const texto = buscar.value.toLowerCase();
        const estado = filtro.value;

        const resultado = citas.filter(cita =>
            (cita.mascota.toLowerCase().includes(texto) ||
                cita.propietario.toLowerCase().includes(texto)) &&
            (estado === "Todas" || cita.estado === estado)
        );

        if (resultado.length === 0) {
            lista.innerHTML = "<p>No hay citas que coincidan.</p>";
            return;
        }

        resultado.forEach(cita => {
            const card = document.createElement("div");
            card.className = "card";
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
                    <button onclick="cambiarEstado(${cita.id}, 'Terminada')">Completada</button>
                    <button onclick="cambiarEstado(${cita.id}, 'Anulada')">Anular</button>
                </div>
            `;
            lista.appendChild(card);
        });
    };

    const guardarCita = () => {
        const hora = inputs.hora.value;
        if (!esHoraValida(hora)) {
            mostrarAviso("La veterinaria atiende de 8:00 AM a 8:00 PM");
            return;
        }

        const esEdicion = inputs.id.value !== '';
        const cita = {
            id: esEdicion ? parseInt(inputs.id.value) : generarId(),
            mascota: inputs.mascota.value.trim(),
            propietario: inputs.propietario.value.trim(),
            telefono: inputs.telefono.value.trim(),
            fecha: inputs.fecha.value,
            hora: inputs.hora.value,
            tipo: inputs.tipo.value,
            sintomas: inputs.sintomas.value.trim(),
            estado: "Abierta"
        };

        if (esEdicion) {
            const i = citas.findIndex(c => c.id === cita.id);
            citas[i] = cita;
        } else {
            citas.push(cita);
        }

        guardarCitas();
        mostrarCitas();
        cerrarModal();
        mostrarAviso(esEdicion ? "Cita actualizada" : "Cita creada", 'success');
    };

    // Acciones globales
    window.editarCita = (id) => {
        const cita = citas.find(c => c.id === id);
        if (!cita) return;

        Object.keys(inputs).forEach(key => {
            inputs[key].value = cita[key];
        });

        abrirModal("Editar Cita");
    };

    window.confirmarEliminar = (id) => {
        idAEliminar = id;
        confirmarModal.classList.remove("oculto");
    };

    window.cambiarEstado = (id, nuevoEstado) => {
        const cita = citas.find(c => c.id === id);
        if (!cita) return;
        cita.estado = nuevoEstado;
        guardarCitas();
        mostrarCitas();
    };

    const eliminarCita = () => {
        citas = citas.filter(c => c.id !== idAEliminar);
        guardarCitas();
        mostrarCitas();
        confirmarModal.classList.add("oculto");
        idAEliminar = null;
    };

    // Eventos
    btnNueva.addEventListener("click", () => {
        limpiarFormulario();
        abrirModal("Nueva Cita");
    });

    btnCerrar.addEventListener("click", cerrarModal);
    buscar.addEventListener("input", mostrarCitas);
    filtro.addEventListener("change", mostrarCitas);
    form.addEventListener("submit", e => {
        e.preventDefault();
        guardarCita();
    });

    btnConfirmar.addEventListener("click", eliminarCita);
    btnCancelar.addEventListener("click", () => {
        confirmarModal.classList.add("oculto");
        idAEliminar = null;
    });

    inputs.hora.addEventListener("change", () => {
        if (!esHoraValida(inputs.hora.value)) {
            mostrarAviso("Recuerda: atención de 8:00 AM a 8:00 PM");
        }
    });

    // Mostrar citas al cargar
    mostrarCitas();
});
