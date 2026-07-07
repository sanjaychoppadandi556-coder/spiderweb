const spiderman = document.querySelector(".spiderman");
const web = document.querySelector(".web");

let direction = 1;
let x = 0;

function moveAcrossScreen() {
  x += direction * 1.2;

  if (x > window.innerWidth - 260) {
    direction = -1;
  }

  if (x < 0) {
    direction = 1;
  }

  spiderman.style.marginLeft = x + "px";
  web.style.marginLeft = x + "px";

  requestAnimationFrame(moveAcrossScreen);
}

moveAcrossScreen();
