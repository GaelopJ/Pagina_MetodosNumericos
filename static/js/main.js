gsap.registerPlugin(ScrollTrigger);

/* ==========================================
   0. ANIMACIÓN DEL PLANO CARTESIANO (CANVAS)
   ========================================== */
const canvas = document.getElementById('math-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let time = 0;
let drawProgress = 0; // Controla el efecto de dibujo progresivo inicial

const config = {
    gridSize: 50,
    gridColor: 'rgba(0, 0, 0, 0.05)', 
    axisColor: 'rgba(0, 0, 0, 0.15)', 
    curveColor: 'rgba(0, 0, 0, 0.8)', 
    curveWidth: 2,
    speed: 0.02, 
    amplitude: 150, 
    frequency: 0.01 
};

function drawMathBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 1. Cuadrícula
    ctx.beginPath();
    ctx.strokeStyle = config.gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += config.gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += config.gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // 2. Ejes
    ctx.beginPath();
    ctx.strokeStyle = config.axisColor;
    ctx.lineWidth = 1.5;
    ctx.moveTo(0, centerY); ctx.lineTo(canvas.width, centerY); 
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, canvas.height); 
    ctx.stroke();

    // 3. Curva con efecto de "dibujo progresivo"
    ctx.beginPath();
    ctx.strokeStyle = config.curveColor;
    ctx.lineWidth = config.curveWidth;
    
    // Hacemos que el límite de dibujo crezca suavemente hasta el ancho total de la pantalla
    if (drawProgress < canvas.width) {
        drawProgress += 15; // Velocidad con la que se "pinta" la línea por primera vez
    }

    for (let x = 0; x < drawProgress; x++) {
        let y = centerY - (Math.sin((x - centerX) * config.frequency + time) * config.amplitude);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    time += config.speed;
    requestAnimationFrame(drawMathBackground);
}
drawMathBackground();

/* ==========================================
   1. CURSOR Y ANIMACIONES (GSAP)
   ========================================== */
const cursor = document.querySelector('.custom-cursor');
gsap.set(cursor, { xPercent: -50, yPercent: -50 });

window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
});

document.querySelectorAll('.interactable').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 2.5, backgroundColor: 'transparent', border: '1px solid var(--text-dark)' }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, backgroundColor: 'var(--text-dark)', border: 'none' }));
});

gsap.from(".hero-title .line", { y: "100%", opacity: 0, duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.2 });
gsap.from(".magnetic-wrap", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.8 });

const btn = document.querySelector('.magnetic-btn');
const btnText = document.querySelector('.btn-text');
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

/* ==========================================
   2. SCROLL HORIZONTAL (LOS PANELES)
   ========================================== */
const hContainer = document.querySelector('.horizontal-container');
gsap.to(hContainer, {
    x: () => -(hContainer.scrollWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
        trigger: '.horizontal-section',
        start: "top top", 
        end: () => `+=${hContainer.scrollWidth}`,
        pin: true, 
        scrub: 1, 
        invalidateOnRefresh: true 
    }
});

/* ==========================================
   3. FOOTER REVEAL
   ========================================== */
const tl = gsap.timeline({ scrollTrigger: { trigger: ".footer-reveal-section", start: "top 60%", end: "bottom bottom", scrub: 1 }});
tl.to('.footer-content', { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "power3.inOut" }, 0); 
tl.to('.footer-content-inner', { scale: 1, duration: 1.5, ease: "power3.inOut" }, 0);


/* ==========================================
   4. CONEXIÓN A FLASK (API MATEMÁTICA)
   ========================================== */
async function ejecutar(metodo) {
    let url = `/api/${metodo}`;
    let datos = { tol: 0.001, max_it: 50 }; 
    let sufijo = metodo === 'biseccion' ? 'bis' : (metodo === 'punto_fijo' ? 'pf' : 'nr');

    try {
        datos.funcion = document.getElementById(`fun-${sufijo}`).value;
        if(metodo === 'biseccion') {
            datos.a = document.getElementById(`a-${sufijo}`).value;
            datos.b = document.getElementById(`b-${sufijo}`).value;
        } else {
            datos.x0 = document.getElementById(`x0-${sufijo}`).value;
        }

        const btnActual = event.target;
        btnActual.innerText = "Calculando...";

        const peticion = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const respuesta = await peticion.json();
        
        btnActual.innerText = "Calcular Raíz";
        
        document.getElementById(`res-${sufijo}`).innerText = `Raíz: ${respuesta.raiz}`;
        
        const tabla = document.getElementById(`tab-${sufijo}`);
        tabla.innerHTML = ""; 

        if (respuesta.historial.length > 0) {
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
        alert("Error matemático. Revisa tu función.");
    }
}