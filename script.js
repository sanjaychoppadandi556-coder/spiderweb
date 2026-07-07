const hero = document.getElementById("spiderman");
const rope = document.getElementById("rope");

let angle = -35;
let direction = 1;
const speed = 0.6;

function swing() {
  angle += speed * direction;

  if (angle >= 35) direction = -1;
  if (angle <= -35) direction = 1;

  rope.style.transform = `rotate(${angle}deg)`;
  hero.style.transform = `rotate(${angle}deg)`;

  requestAnimationFrame(swing);
}

swing();
