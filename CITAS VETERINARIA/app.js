document.addEventListener('DOMContentLoaded', () => {
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
    const animalImagen = document.getElementById('animalImagen');

    const inputs = {
        id: document.getElementById('id-cita'),
        mascota: document.getElementById('mascota'),
        propietario: document.getElementById('propietario'),
        telefono: document.getElementById('telefono'),
        fecha: document.getElementById('fecha'),
        hora: document.getElementById('hora'),
        tipo: document.getElementById('tipo'),
        sintomas: document.getElementById('sintomas'),
        estado: document.getElementById('estado')
    };

    let citas = JSON.parse(localStorage.getItem('citas')) || [];
    let idAEliminar = null;

    const imagenes = {
        Perro: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
        Gato: 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
        Ave: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
        Conejo: 'https://cdn-icons-png.flaticon.com/512/1998/1998610.png',
        Hamster: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
        Tortuga: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
        Pez: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
        Reptil: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
        Caballo: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
        Otro: 'https://cdn-icons-png.flaticon.com/512/616/616408.png'
    };

    const actualizarImagen = () => {
        const tipo = inputs.tipo.value;
        animalImagen.src = imagenes[tipo] || '';
    };

    const guardarCitas = () => localStorage.setItem('citas', JSON.stringify(citas));
    const generarId = () => Date.now();

    const limpiarFormulario = () => {
        form.reset();
        inputs.id.value = '';
        animalImagen.src = '';
    };

    const abrirModal = (titulo = 'Nueva Cita') => {
        document.getElementById('modal-titulo').textContent = titulo;
        modal.classList.remove('oculto');
    };

    const cerrarModal = () => modal.classList.add('oculto');

    const esHoraValida = (hora) => {
        const [h, m] = hora.split(':').map(Number);
        const minutos = h * 60 + m;
        return minutos >= 480 && minutos <= 1200;
    };

    const tieneEspacios = (str) => /^\s|\s$/.test(str);

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

    const mostrarCitas = () => {
        lista.innerHTML = '';
        const texto = buscar.value.toLowerCase();
        const estado = filtro.value;

        const resultado = citas.filter(cita =>
            (cita.mascota.toLowerCase().includes(texto) ||
                cita.propietario.toLowerCase().includes(texto)) &&
            (estado === 'Todas' || cita.estado === estado)
        );

        if (resultado.length === 0) {
            lista.innerHTML = '<p>No hay citas que coincidan.</p>';
            return;
        }

        resultado.forEach(cita => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
        <img src="${imagenes[cita.tipo] || ''}" alt="${cita.tipo}" style="width: 100%; max-height: 200px; object-fit: contain; margin-bottom: 1rem;" />
        <h3>${cita.mascota} (${cita.tipo})</h3>
        <p><strong>Propietario:</strong> ${cita.propietario}</p>
        <p><strong>Teléfono:</strong> ${cita.telefono}</p>
        <p><strong>Fecha:</strong> ${cita.fecha} ${cita.hora}</p>
        <p><strong>Síntomas:</strong> ${cita.sintomas}</p>
        <p><strong>Estado:</strong> ${cita.estado}</p>
        <div class="acciones-card">
          <button onclick="editarCita(${cita.id})">Editar</button>
          <button onclick="confirmarEliminar(${cita.id})">Eliminar</button>
        </div>
      `;
            lista.appendChild(card);
        });
    };

    const guardarCita = () => {
        const hora = inputs.hora.value;
        if (!esHoraValida(hora)) {
            mostrarAviso('La veterinaria atiende de 8:00 AM a 8:00 PM');
            return;
        }

        if (
            tieneEspacios(inputs.mascota.value) ||
            tieneEspacios(inputs.propietario.value)
        ) {
            mostrarAviso('El nombre de la mascota o propietario no debe empezar ni terminar con espacios');
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
            estado: inputs.estado.value
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
        mostrarAviso(esEdicion ? 'Cita actualizada' : 'Cita creada', 'success');
    };

    window.editarCita = (id) => {
        const cita = citas.find(c => c.id === id);
        if (!cita) return;

        Object.keys(inputs).forEach(key => {
            inputs[key].value = cita[key];
        });

        actualizarImagen();
        abrirModal('Editar Cita');
    };

    window.confirmarEliminar = (id) => {
        idAEliminar = id;
        confirmarModal.classList.remove('oculto');
    };

    const eliminarCita = () => {
        citas = citas.filter(c => c.id !== idAEliminar);
        guardarCitas();
        mostrarCitas();
        confirmarModal.classList.add('oculto');
        idAEliminar = null;
    };

    btnNueva.addEventListener('click', () => {
        limpiarFormulario();
        abrirModal('Nueva Cita');
    });

    btnCerrar.addEventListener('click', cerrarModal);
    buscar.addEventListener('input', mostrarCitas);
    filtro.addEventListener('change', mostrarCitas);
    form.addEventListener('submit', e => {
        e.preventDefault();
        guardarCita();
    });

    btnConfirmar.addEventListener('click', eliminarCita);
    btnCancelar.addEventListener('click', () => {
        confirmarModal.classList.add('oculto');
        idAEliminar = null;
    });

    inputs.hora.addEventListener('change', () => {
        if (!esHoraValida(inputs.hora.value)) {
            mostrarAviso('Recuerda: atención de 8:00 AM a 8:00 PM');
        }
    });

    inputs.tipo.addEventListener('change', actualizarImagen);

    mostrarCitas();
});
