const canvas = document.getElementById("spiderCanvas");
const ctx = canvas.getContext("2d");
const codeBox = document.getElementById("codeBox");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for (let i = 0; i < 80; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.7,
    vy: (Math.random() - 0.5) * 0.7,
    r: Math.random() * 2 + 1
  });
}

function drawSpiderLightning() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 140) {
        ctx.strokeStyle = `rgba(150,220,255,${1 - dist / 140})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#58a6ff";
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawSpiderLightning);
}

drawSpiderLightning();

const code = `const canvas = document.getElementById("spiderCanvas");
const ctx = canvas.getContext("2d");

function createSpiderLightning() {
  drawParticles();
  connectNearbyPoints();
  requestAnimationFrame(createSpiderLightning);
}

createSpiderLightning();`;

let i = 0;

function typeCode() {
  if (i < code.length) {
    codeBox.innerHTML = code.substring(0, i) + '<span class="cursor">|</span>';
    i++;
    setTimeout(typeCode, 35);
  }
}

typeCode();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
