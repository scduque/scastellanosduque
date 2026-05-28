
  const blocks = document.querySelectorAll('.about-c19-block');

  const revealOnScroll = () => {
    const trigger = window.innerHeight * 0.9;
    blocks.forEach(block => {
      const top = block.getBoundingClientRect().top;
      if (top < trigger) {
        block.classList.add('visible');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('load', revealOnScroll);


let foto_actual_visor = 0;
let autoplay_activo_visor = true;
let intervalo_visor;

const fotos_visor = [
  "images/s-vagabundo/sv-pic-01.png",
  "images/s-vagabundo/sv-pic-02.png",
  "images/s-vagabundo/sv-pic-03.png",
  "images/s-vagabundo/sv-pic-04.png",
  "images/s-vagabundo/sv-pic-05.png",
  "images/s-vagabundo/sv-pic-06.png",
  "images/s-vagabundo/sv-pic-07.png",
  "images/s-vagabundo/sv-pic-08.png",
  "images/s-vagabundo/sv-pic-09.png",
  "images/s-vagabundo/sv-pic-10.png",
  "images/s-vagabundo/sv-pic-11.png",
  "images/s-vagabundo/sv-pic-12.png",
];

function actualizar_foto_visor() {
  const imagen = document.getElementById("imagen_foto_proyecto");
  imagen.style.opacity = 0;
  setTimeout(() => {
    imagen.src = fotos_visor[foto_actual_visor];
    imagen.style.opacity = 1;
  }, 150);
}

function foto_anterior_visor() {
  foto_actual_visor = (foto_actual_visor - 1 + fotos_visor.length) % fotos_visor.length;
  actualizar_foto_visor();
}

function foto_siguiente_visor() {
  foto_actual_visor = (foto_actual_visor + 1) % fotos_visor.length;
  actualizar_foto_visor();
}

function alternar_autoplay_visor() {
  autoplay_activo_visor = !autoplay_activo_visor;
  const boton = document.getElementById("boton_autoplay_visor");
  boton.textContent = autoplay_activo_visor ? "⏸ Pausar" : "▶ Reanudar";
}

function iniciar_autoplay_visor() {
  intervalo_visor = setInterval(() => {
    if (autoplay_activo_visor) {
      foto_siguiente_visor();
    }
  }, 4000);
}

// Swipe móvil
const visor = document.getElementById("contenedor_visor_fotos");
let inicio_x_visor = 0;
let fin_x_visor = 0;

// Agregar listener con { passive: true }
visor.addEventListener("touchstart", e => {
  inicio_x_visor = e.changedTouches[0].screenX;
}, { passive: true });

visor.addEventListener("touchend", e => {
  fin_x_visor = e.changedTouches[0].screenX;
  interpretar_swipe_visor();
});

function interpretar_swipe_visor() {
  const diferencia = inicio_x_visor - fin_x_visor;
  if (diferencia > 50) foto_siguiente_visor();
  else if (diferencia < -50) foto_anterior_visor();
}

// 🚀 Iniciar todo
actualizar_foto_visor();
iniciar_autoplay_visor();
