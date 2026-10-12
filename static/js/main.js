gsap.registerPlugin(ScrollTrigger);

/* ==========================================
   1. CURSOR PERSONALIZADO (Global)
   ========================================== */
const cursor = document.querySelector('.custom-cursor');
if (cursor) {
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
    });

    document.querySelectorAll('.interactable').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
}

/* ==========================================
   2. ANIMACIÓN DEL CANVAS DE FONDO (Solo Index)
   ========================================== */
const canvas = document.getElementById('math-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let time = 0; let drawProgress = 0;
    const config = { gridSize: 50, gridColor: 'rgba(0,0,0,0.05)', axisColor: 'rgba(0,0,0,0.15)', curveColor: 'rgba(0,0,0,0.8)', curveWidth: 2, speed: 0.02, amplitude: 150, frequency: 0.01 };

    function drawMathBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        const centerX = canvas.width / 2; const centerY = canvas.height / 2;

        ctx.beginPath(); ctx.strokeStyle = config.gridColor; ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += config.gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for (let y = 0; y <= canvas.height; y += config.gridSize) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();

        ctx.beginPath(); ctx.strokeStyle = config.axisColor; ctx.lineWidth = 1.5;
        ctx.moveTo(0, centerY); ctx.lineTo(canvas.width, centerY); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, canvas.height); 
        ctx.stroke();

        ctx.beginPath(); ctx.strokeStyle = config.curveColor; ctx.lineWidth = config.curveWidth;
        if (drawProgress < canvas.width) drawProgress += 15;
        for (let x = 0; x < drawProgress; x++) {
            let y = centerY - (Math.sin((x - centerX) * config.frequency + time) * config.amplitude);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        time += config.speed; requestAnimationFrame(drawMathBackground);
    }
    drawMathBackground();

    // Desvanecer canvas al hacer scroll
    gsap.to(canvas, { opacity: 0, scrollTrigger: { trigger: ".about-section", start: "top bottom", end: "top 30%", scrub: true }});
}

/* ==========================================
   3. ANIMACIONES DEL HERO Y BOTÓN (Solo Index)
   ========================================== */
const lineasTitulo = document.querySelectorAll(".hero-title .line");
if (lineasTitulo.length > 0) {
    gsap.from(lineasTitulo[0], { y: "100%", duration: 1.5, ease: "power4.out", delay: 0.2 });
    gsap.to(lineasTitulo[0], { x: 70, duration: 1.8, ease: "power3.inOut", delay: 1.2 });
    gsap.from(lineasTitulo[1], { y: "-100%", duration: 1.5, ease: "power4.out", delay: 0.2 });
    gsap.from(".magnetic-wrap", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.8 });
}

const btn = document.querySelector('.magnetic-btn');
const btnText = document.querySelector('.btn-text');
if (btn && btnText) {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) * 0.4;
        const y = (e.clientY - (rect.top + rect.height / 2)) * 0.4;
        gsap.to(btn, { x: x, y: y, duration: 0.3, ease: "power2.out" });
        gsap.to(btnText, { x: x * 0.5, y: y * 0.5, duration: 0.3 });
    });
    btn.addEventListener('mouseleave', () => {
        gsap.to([btn, btnText], { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
}

/* ==========================================
   4. ANIMACIONES DE SCROLL (Solo Index)
   ========================================== */
const aboutBlocks = document.querySelectorAll('.about-block');
if (aboutBlocks.length > 0) {
    aboutBlocks.forEach(block => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: block, start: "top 80%", end: "bottom 20%", scrub: 1 }});
        tl.fromTo(block, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 2, ease: "power2.out" })
          .to(block, { opacity: 1, duration: 1.5 })
          .to(block, { opacity: 0, y: -100, duration: 2, ease: "power2.in" });
    });
}

const hContainer = document.querySelector('.horizontal-container');
if (hContainer) {
    gsap.to(hContainer, {
        x: () => -(hContainer.scrollWidth - window.innerWidth), ease: "none",
        scrollTrigger: { trigger: '.horizontal-section', start: "top top", end: () => `+=${hContainer.scrollWidth}`, pin: true, scrub: 1, invalidateOnRefresh: true }
    });
}

const footerSection = document.querySelector(".footer-reveal-section");
if (footerSection) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: footerSection, start: "top 60%", end: "bottom bottom", scrub: 1 }});
    tl.to('.footer-content', { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "power3.inOut" }, 0); 
    tl.to('.footer-content-inner', { scale: 1, duration: 1.5, ease: "power3.inOut" }, 0);
}

/* ==========================================
    5. CONEXIÓN A FLASK (API MATEMÁTICA)
   ========================================== */
async function ejecutar(metodo) {
    let url = `/api/${metodo}`;
    
    // Asignamos el prefijo correcto según el método (coincide con los IDs del HTML)
    let sufijo = '';
    if (metodo === 'punto_fijo') sufijo = 'pf';
    else if (metodo === 'newton_raphson') sufijo = 'nr';
    else if (metodo === 'secante') sufijo = 'sec';
    else if (metodo === 'biseccion') sufijo = 'bis';

    try {
        // 1. Extraemos los campos que TODOS los métodos usan
        let datos = {
            funcion: document.getElementById(`fun-${sufijo}`).value,
            tol: parseFloat(document.getElementById(`tol-${sufijo}`).value),
            max_it: parseInt(document.getElementById(`iter-${sufijo}`).value)
        };

        // 2. Extraemos los campos específicos de cada algoritmo
        if(metodo === 'biseccion') {
            datos.a = parseFloat(document.getElementById(`a-${sufijo}`).value);
            datos.b = parseFloat(document.getElementById(`b-${sufijo}`).value);
        } else if (metodo === 'secante') {
            datos.x0 = parseFloat(document.getElementById(`x0-${sufijo}`).value);
            datos.x1 = parseFloat(document.getElementById(`x1-${sufijo}`).value);
        } else {
            // Punto Fijo y Newton-Raphson solo requieren x0
            datos.x0 = parseFloat(document.getElementById(`x0-${sufijo}`).value);
        }

        // Efecto de carga en el botón
        const btnActual = document.querySelector(`#${metodo.replace('_', '-')} .calc-btn`);
        if(btnActual) btnActual.innerText = "Calculando...";

        // Enviamos a Flask
        const peticion = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        const respuesta = await peticion.json();
        
        // Restauramos el botón
        if(btnActual) btnActual.innerText = "Calcular";
        
        // Mostramos el resultado final
        document.getElementById(`res-${sufijo}`).innerText = `Raíz: ${respuesta.raiz}`;
        
        // Dibujamos la tabla de iteraciones
        const tabla = document.getElementById(`tab-${sufijo}`);
        tabla.innerHTML = ""; 

        if (respuesta.historial && respuesta.historial.length > 0) {
            let thead = "<thead><tr>";
            let llaves = Object.keys(respuesta.historial[0]); 
            for (let k of llaves) thead += `<th>${k}</th>`;
            thead += "</tr></thead><tbody>";
            
            for (let paso of respuesta.historial) {
                thead += "<tr>";
                for (let k of llaves) thead += `<td>${paso[k]}</td>`;
                thead += "</tr>";
            }
            tabla.innerHTML = thead + "</tbody>";
        }
    } catch (error) {
        console.error(error);
        alert("Error matemático. Revisa tu función o los parámetros ingresados.");
        const btnActual = document.querySelector(`#${metodo.replace('_', '-')} .calc-btn`);
        if(btnActual) btnActual.innerText = "Calcular";
    }
}
