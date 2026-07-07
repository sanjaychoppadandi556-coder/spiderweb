const canvas = document.getElementById("lightningCanvas");
const ctx = canvas.getContext("2d");
const codeBox = document.getElementById("codeBox");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
let bolts = [];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createStars() {
  stars = [];

  for (let i = 0; i < 120; i++) {
    stars.push({
      x: random(0, canvas.width),
      y: random(0, canvas.height),
      size: random(0.7, 1.8),
      alpha: random(0.25, 1),
      speed: random(0.002, 0.008)
    });
  }
}

function createLightning() {
  const startSide = Math.floor(random(0, 4));
  let x, y;

  if (startSide === 0) {
    x = random(0, canvas.width);
    y = 0;
  } else if (startSide === 1) {
    x = canvas.width;
    y = random(0, canvas.height * 0.7);
  } else if (startSide === 2) {
    x = random(0, canvas.width);
    y = canvas.height;
  } else {
    x = 0;
    y = random(0, canvas.height * 0.7);
  }

  const targetX = canvas.width / 2 + random(-160, 160);
  const targetY = canvas.height / 2 + random(-120, 80);

  let points = [];
  points.push({ x, y });

  const segments = 22;

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;

    const px = x + (targetX - x) * t + random(-45, 45);
    const py = y + (targetY - y) * t + random(-45, 45);

    points.push({ x: px, y: py });
  }

  bolts.push({
    points,
    life: 1,
    branches: createBranches(points)
  });
}

function createBranches(points) {
  let branches = [];

  for (let i = 3; i < points.length - 3; i += 4) {
    let start = points[i];
    let branch = [{ x: start.x, y: start.y }];

    let angle = random(0, Math.PI * 2);
    let length = random(60, 140);
    let steps = 6;

    let x = start.x;
    let y = start.y;

    for (let j = 0; j < steps; j++) {
      x += Math.cos(angle) * (length / steps) + random(-20, 20);
      y += Math.sin(angle) * (length / steps) + random(-20, 20);
      branch.push({ x, y });
    }

    branches.push(branch);
  }

  return branches;
}

function drawStars() {
  stars.forEach(star => {
    star.alpha += star.speed;

    if (star.alpha > 1 || star.alpha < 0.2) {
      star.speed *= -1;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBolt(points, life, width) {
  ctx.save();

  ctx.shadowBlur = 18;
  ctx.shadowColor = "white";

  ctx.beginPath();

  points.forEach((p, i) => {
    const jitterX = random(-3, 3);
    const jitterY = random(-3, 3);

    if (i === 0) {
      ctx.moveTo(p.x + jitterX, p.y + jitterY);
    } else {
      ctx.lineTo(p.x + jitterX, p.y + jitterY);
    }
  });

  ctx.strokeStyle = `rgba(255,255,255,${life})`;
  ctx.lineWidth = width;
  ctx.stroke();

  ctx.strokeStyle = `rgba(255,255,255,${life * 0.35})`;
  ctx.lineWidth = width + 5;
  ctx.stroke();

  ctx.restore();
}

function drawLightning() {
  if (Math.random() < 0.065) {
    createLightning();
  }

  bolts.forEach((bolt, index) => {
    drawBolt(bolt.points, bolt.life, 1.5);

    bolt.branches.forEach(branch => {
      drawBolt(branch, bolt.life * 0.75, 1);
    });

    bolt.life -= 0.035;

    if (bolt.life <= 0) {
      bolts.splice(index, 1);
    }
  });
}

function animate() {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();
  drawLightning();

  requestAnimationFrame(animate);
}

createStars();
animate();

const code = `const canvas = document.getElementById("lightningCanvas");
const ctx = canvas.getContext("2d");

function createLightning() {
  drawStars();
  drawElectricBranches();
  requestAnimationFrame(createLightning);
}

createLightning();`;

let index = 0;

function typeCode() {
  if (index < code.length) {
    codeBox.innerHTML =
      code.substring(0, index) + '<span class="cursor">|</span>';
    index++;
    setTimeout(typeCode, 35);
  }
}

typeCode();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createStars();
});
