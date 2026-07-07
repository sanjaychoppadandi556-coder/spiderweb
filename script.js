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

  for (let i = 0; i < 130; i++) {
    stars.push({
      x: random(0, canvas.width),
      y: random(0, canvas.height),
      size: random(1, 2.5),
      alpha: random(0.2, 1),
      speed: random(0.002, 0.01)
    });
  }
}

function createLightning() {
  const startX = random(0, canvas.width);
  const startY = random(0, canvas.height * 0.45);

  let points = [];
  let x = startX;
  let y = startY;

  points.push({ x, y });

  for (let i = 0; i < 18; i++) {
    x += random(-80, 90);
    y += random(25, 55);

    points.push({ x, y });

    if (x < 0 || x > canvas.width || y > canvas.height) break;
  }

  bolts.push({
    points,
    life: 1,
    branches: createBranches(points)
  });
}

function createBranches(points) {
  let branches = [];

  for (let i = 2; i < points.length - 2; i += 3) {
    let start = points[i];
    let branch = [{ x: start.x, y: start.y }];

    let x = start.x;
    let y = start.y;

    for (let j = 0; j < 6; j++) {
      x += random(-70, 70);
      y += random(-15, 45);
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

function drawBoltPath(points, life, width) {
  ctx.beginPath();

  for (let i = 0; i < points.length; i++) {
    let p = points[i];

    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x + random(-4, 4), p.y + random(-4, 4));
    }
  }

  ctx.strokeStyle = `rgba(255,255,255,${life})`;
  ctx.lineWidth = width;
  ctx.shadowBlur = 22;
  ctx.shadowColor = "white";
  ctx.stroke();

  ctx.strokeStyle = `rgba(120,190,255,${life * 0.7})`;
  ctx.lineWidth = width + 3;
  ctx.shadowBlur = 35;
  ctx.shadowColor = "#58a6ff";
  ctx.stroke();
}

function drawLightning() {
  if (Math.random() < 0.045) {
    createLightning();
  }

  bolts.forEach((bolt, index) => {
    drawBoltPath(bolt.points, bolt.life, 2);

    bolt.branches.forEach(branch => {
      drawBoltPath(branch, bolt.life * 0.7, 1);
    });

    bolt.life -= 0.025;

    if (bolt.life <= 0) {
      bolts.splice(index, 1);
    }
  });
}

function animate() {
  ctx.fillStyle = "rgba(0,0,0,0.18)";
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
