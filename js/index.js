function generarFormasGeometricas() {
  const contenedor = document.getElementById("animaciones-geometricas-sobre");
  const colors = ["#334155", "#1e3a8a"];

  // Crear líneas
  for (let i = 0; i < 6; i++) {
    const x1 = Math.random() * 1400;
    const x2 = x1 + 150 + Math.random() * 100;
    const y = 100 + Math.random() * 300;
    const delay = Math.random() * 6;

    const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
    linea.setAttribute("x1", x1);
    linea.setAttribute("y1", y);
    linea.setAttribute("x2", x2);
    linea.setAttribute("y2", y);
    linea.setAttribute("class", "forma-geometrica-linea");
    linea.style.stroke = colors[Math.floor(Math.random() * colors.length)];
    linea.style.animationDelay = delay + "s";

    contenedor.appendChild(linea);
  }

  // Crear triángulos
  for (let i = 0; i < 5; i++) {
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const size = Math.random() * 12 + 8;
    const x = Math.random() * 1300 + 50;
    const y = Math.random() * 350 + 100;
    const rot = Math.random() * 360;
    const delay = Math.random() * 8;

    poly.setAttribute("points", "0,0 10,17 20,0");
    poly.setAttribute("class", "forma-geometrica-triangulo");
    poly.setAttribute("transform", `translate(${x}, ${y}) scale(${size / 10}) rotate(${rot})`);
    poly.style.animationDelay = delay + "s";

    contenedor.appendChild(poly);
  }
}

// Ejecutar al cargar
document.addEventListener("DOMContentLoaded", () => {
  generarFormasGeometricas();
});
