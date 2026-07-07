const spider = document.querySelector(".spider");
const web = document.querySelector(".web-line");

let x = -120;
let y = 120;

function moveSpider() {

  x += 2;

  if (x > window.innerWidth + 120) {
    x = -120;
    y = Math.random() * (window.innerHeight - 250) + 80;
  }

  spider.style.left = x + "px";
  spider.style.top = y + "px";

  web.style.left = (x + 45) + "px";
  web.style.height = y + "px";

  requestAnimationFrame(moveSpider);
}

moveSpider();
