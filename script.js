import * as THREE from "three";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth/window.innerHeight,
    0.1,
    5000
);

camera.position.set(0,25,60);

const renderer = new THREE.WebGLRenderer({
    antialias:true
});

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled=true;

document.body.appendChild(renderer.domElement);

// Ambient Light
const ambient=new THREE.AmbientLight(0xffffff,2);
scene.add(ambient);

// Sun Light
const sun=new THREE.DirectionalLight(0xffffff,3);

sun.position.set(80,150,60);

sun.castShadow=true;

scene.add(sun);

// Ground
const groundGeometry=new THREE.PlaneGeometry(1000,1000);

const groundMaterial=new THREE.MeshStandardMaterial({
    color:0x3cb043
});

const ground=new THREE.Mesh(
    groundGeometry,
    groundMaterial
);

ground.rotation.x=-Math.PI/2;

ground.receiveShadow=true;

scene.add(ground);

// Grid
const grid=new THREE.GridHelper(1000,100);

scene.add(grid);

// Animate
function animate(){

    requestAnimationFrame(animate);

    renderer.render(scene,camera);

}

animate();

window.addEventListener("resize",()=>{

camera.aspect=window.innerWidth/window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(window.innerWidth,window.innerHeight);

});

// Hide loading
setTimeout(()=>{

document.getElementById("loading").style.display="none";

},1000);
