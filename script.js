const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyxJMYAaWLWz4XAosYjvVUmQxyOn2HwSMMDRWmrHTDp1sKhldExoHVMSGaAucri0BBoSw/exec';

// Función para mostrar la vista previa de la imagen
document.getElementById('regFoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('preview');
            preview.src = e.target.result;
            document.getElementById('previewContainer').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Función para registrar nuevo ganado
async function registrarGanado(event) {
    event.preventDefault();

    const nombre = document.getElementById('regNombre').value;
    const fecha = document.getElementById('regFecha').value;
    const dueño = document.getElementById('regDueño').value;
    const hijo = document.getElementById('regHijo').value;
    const fotoInput = document.getElementById('regFoto');

    if (!fotoInput.files || !fotoInput.files[0]) {
        alert('Por favor seleccione una foto');
        return false;
    }

    try {
        // Mostrar indicador de carga
        document.body.style.cursor = 'wait';
        
        // Convertir la imagen a base64
        const file = fotoInput.files[0];
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });

        const data = {
            nombre: nombre,
            fecha: fecha,
            dueño: dueño,
            hijo: hijo,
            foto: base64
        };

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.result === 'success') {
            alert('Registro guardado exitosamente');
            document.getElementById('registroForm').reset();
            document.getElementById('previewContainer').style.display = 'none';
        } else {
            throw new Error(result.message || 'Error al guardar el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el registro: ' + error.message);
    } finally {
        document.body.style.cursor = 'default';
    }

    return false;
}

// Función para buscar ganado
async function buscarGanado(event) {
    event.preventDefault();

    const nombre = document.getElementById('busNombre').value;
    const fecha = document.getElementById('busFecha').value;
    const dueño = document.getElementById('busDueño').value;
    const hijo = document.getElementById('busHijo').value;

    try {
        // Mostrar indicador de carga
        document.body.style.cursor = 'wait';
        
        const url = `${SCRIPT_URL}?nombre=${encodeURIComponent(nombre)}&fecha=${encodeURIComponent(fecha)}&dueño=${encodeURIComponent(dueño)}&hijo=${encodeURIComponent(hijo)}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.result === 'success') {
            mostrarResultados(result.data);
        } else {
            throw new Error(result.message || 'Error en la búsqueda');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al realizar la búsqueda: ' + error.message);
    } finally {
        document.body.style.cursor = 'default';
    }

    return false;
}

// Función para mostrar los resultados
function mostrarResultados(resultados) {
    const contenedor = document.getElementById('resultados');
    contenedor.innerHTML = '';

    if (resultados.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-info">No se encontraron resultados</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'row row-cols-1 row-cols-md-3 g-4';

    resultados.forEach(registro => {
        const col = document.createElement('div');
        col.className = 'col';
        
        // Crear un contenedor para la imagen con proporción aspectual
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        imgContainer.style.width = '100%';
        imgContainer.style.paddingBottom = '75%'; // Proporción 4:3
        imgContainer.style.overflow = 'hidden';
        
        const img = document.createElement('img');
        img.src = registro.foto;
        img.alt = registro.nombre;
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.backgroundColor = '#f8f9fa';
        
        imgContainer.appendChild(img);
        
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-img-container">
                    ${imgContainer.outerHTML}
                </div>
                <div class="card-body">
                    <h5 class="card-title">${registro.nombre}</h5>
                    <p class="card-text">
                        <strong>Fecha:</strong> ${registro.fecha}<br>
                        <strong>Dueño:</strong> ${registro.dueño}<br>
                        <strong>Hijo/a de:</strong> ${registro.hijo}
                    </p>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });

    contenedor.appendChild(grid);
}