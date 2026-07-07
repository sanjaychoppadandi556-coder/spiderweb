const hero = document.getElementById("spiderman");
const rope = document.getElementById("rope");

let angle = -45;
let speed = 1.2;
let direction = 1;

function animate(){

    angle += speed * direction;

    if(angle>45){
        direction=-1;
    }

    if(angle<-45){
        direction=1;
    }

    hero.style.transform =
        `rotate(${angle}deg)`;

    rope.style.transform =
        `rotate(${angle}deg)`;

    requestAnimationFrame(animate);
}

animate();
