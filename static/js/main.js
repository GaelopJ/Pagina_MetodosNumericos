// 1. INICIALIZAR LENIS (Smooth Scrolling Profesional)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. ANIMACIONES GSAP (Aparición de elementos)
gsap.registerPlugin(ScrollTrigger);

// Animar el texto gigante del inicio
gsap.from(".hero-title", {
    y: 100, opacity: 0, duration: 1, ease: "power4.out", delay: 0.2
});

// Animar los acordeones en cascada
gsap.from(".acordeon", {
    y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.5
});

// Animar los acordeones forzando su aparición (fromTo)
gsap.fromTo(".acordeon", 
    { y: 50, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.8 }
);

// 3. LÓGICA DE LA INTERFAZ (Selector de Método)
const selector = document.getElementById('selector-metodo');
const divBiseccion = document.getElementById('inputs-biseccion');
const divPuntoFijo = document.getElementById('inputs-punto-fijo');

selector.addEventListener('change', (e) => {
    if(e.target.value === 'biseccion') {
        divBiseccion.style.display = 'grid';
        divPuntoFijo.style.display = 'none';
        document.getElementById('funcion').value = "x**3 - x - 2"; // Ejemplo biseccion
    } else {
        divBiseccion.style.display = 'none';
        divPuntoFijo.style.display = 'grid';
        document.getElementById('funcion').value = "exp(-x)"; // Ejemplo punto fijo
    }
});

// 4. CONEXIÓN CON FLASK (El cerebro)
document.getElementById('btn-calcular').addEventListener('click', async () => {
    const metodo = selector.value;
    let url = '';
    let datos = {};

    // Armar el paquete según el método seleccionado
    if(metodo === 'biseccion') {
        url = '/api/biseccion';
        datos = {
            "funcion": document.getElementById('funcion').value,
            "a": document.getElementById('a').value,
            "b": document.getElementById('b').value,
            "tol": document.getElementById('tol').value,
            "max_it": document.getElementById('max_it').value
        };
    } else {
        url = '/api/punto_fijo';
        datos = {
            "funcion": document.getElementById('funcion').value,
            "x0": document.getElementById('x0').value,
            "tol": document.getElementById('tol').value,
            "max_it": document.getElementById('max_it').value
        };
    }

    try {
        // Enviar datos al servidor
        document.getElementById('btn-calcular').innerText = "Calculando...";
        
        const peticion = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const respuesta = await peticion.json();
        
        // Restaurar botón
        document.getElementById('btn-calcular').innerText = "Ejecutar Cálculo";

        // Dibujar resultados
        document.getElementById("texto-raiz").innerText = "Raíz: " + respuesta.raiz;
        
        const cabecera = document.getElementById("cabecera-tabla");
        const cuerpo = document.getElementById("cuerpo-tabla");
        cabecera.innerHTML = ""; cuerpo.innerHTML = "";

        if (respuesta.historial && respuesta.historial.length > 0) {
            let filaTitulos = "<tr>";
            let llaves = Object.keys(respuesta.historial[0]); 
            for (let llave of llaves) filaTitulos += `<th>${llave}</th>`;
            filaTitulos += "</tr>";
            cabecera.innerHTML = filaTitulos;

            for (let paso of respuesta.historial) {
                let fila = "<tr>";
                for (let llave of llaves) fila += `<td>${paso[llave]}</td>`;
                fila += "</tr>";
                cuerpo.innerHTML += fila;
            }

            // Animar la aparición de la tabla
            gsap.from("#tabla-resultados", { y: 30, opacity: 0, duration: 0.5 });
        }
    } catch (error) {
        alert("Error de conexión o sintaxis matemática.");
        document.getElementById('btn-calcular').innerText = "Ejecutar Cálculo";
        console.error(error);
    }
});