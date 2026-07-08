import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd3ff);
scene.fog = new THREE.Fog(0x8fd3ff, 180, 1000);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);
camera.position.set(0, 25, 55);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 15;
controls.maxDistance = 120;

scene.add(new THREE.AmbientLight(0xffffff, 1.25));

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(150, 260, 140);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1400, 1400),
    new THREE.MeshStandardMaterial({ color: 0x3fa65a, roughness: 0.85 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const roadMat = new THREE.MeshStandardMaterial({ color: 0x202020, roughness: 0.75 });
const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.8 });
const windowMat = new THREE.MeshStandardMaterial({
    color: 0xffe79a,
    emissive: 0xffcc55,
    emissiveIntensity: 0.55
});

const buildingMats = [
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 })
];

function box(w, h, d, mat, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

function createRoad(width, length, x, z, rotate = false) {
    const sidewalk = box(width + 8, 0.18, length, sidewalkMat, x, 0.01, z);
    if (rotate) sidewalk.rotation.y = Math.PI / 2;

    const road = box(width, 0.12, length, roadMat, x, 0.09, z);
    if (rotate) road.rotation.y = Math.PI / 2;
}

for (let i = -600; i <= 600; i += 100) {
    createRoad(18, 1300, i, 0, false);
    createRoad(18, 1300, 0, i, true);
}

function createWindows(building, width, depth, height) {
    const rows = Math.floor(height / 10);
    const colsFront = Math.floor(width / 7);
    const colsSide = Math.floor(depth / 7);

    for (let r = 1; r < rows; r++) {
        for (let c = 0; c < colsFront; c++) {
            if (Math.random() > 0.35) {
                const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.8), windowMat);
                win.position.set(
                    building.position.x - width / 2 + 4 + c * 7,
                    r * 8,
                    building.position.z + depth / 2 + 0.08
                );
                scene.add(win);
            }
        }

        for (let c = 0; c < colsSide; c++) {
            if (Math.random() > 0.4) {
                const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.8), windowMat);
                win.position.set(
                    building.position.x + width / 2 + 0.08,
                    r * 8,
                    building.position.z - depth / 2 + 4 + c * 7
                );
                win.rotation.y = Math.PI / 2;
                scene.add(win);
            }
        }
    }
}

function createRooftop(building, width, depth, height) {
    box(width * 0.55, 5, depth * 0.45, building.material, building.position.x, height + 2.5, building.position.z);
    box(width * 0.18, 14, depth * 0.18, building.material, building.position.x + width * 0.25, height + 7, building.position.z - depth * 0.2);
}

function createBuilding(x, z, width, depth, height) {
    const mat = buildingMats[Math.floor(Math.random() * buildingMats.length)];
    const building = box(width, height, depth, mat, x, height / 2, z);
    createWindows(building, width, depth, height);
    createRooftop(building, width, depth, height);
}

for (let x = -550; x <= 550; x += 100) {
    for (let z = -550; z <= 550; z += 100) {
        if (Math.abs(x) < 70 && Math.abs(z) < 70) continue;

        const count = 2 + Math.floor(Math.random() * 3);

        for (let i = 0; i < count; i++) {
            createBuilding(
                x - 25 + Math.random() * 50,
                z - 25 + Math.random() * 50,
                20 + Math.random() * 28,
                20 + Math.random() * 28,
                45 + Math.random() * 170
            );
        }
    }
}

function createStreetLight(x, z) {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const lampMat = new THREE.MeshStandardMaterial({
        color: 0xfff3b0,
        emissive: 0xffcc55,
        emissiveIntensity: 1
    });

    box(0.8, 12, 0.8, poleMat, x, 6, z);
    box(4, 0.6, 2, lampMat, x, 12.5, z);

    const light = new THREE.PointLight(0xffdd88, 0.8, 45);
    light.position.set(x, 13, z);
    scene.add(light);
}

for (let i = -550; i <= 550; i += 100) {
    createStreetLight(i + 22, 22);
    createStreetLight(i - 22, -22);
    createStreetLight(22, i + 22);
    createStreetLight(-22, i - 22);
}

function createTree(x, z) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b3f1d });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x176b2c });

    box(3, 10, 3, trunkMat, x, 5, z);

    const leaves = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), leafMat);
    leaves.position.set(x, 14, z);
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    scene.add(leaves);
}

for (let i = 0; i < 120; i++) {
    const x = -600 + Math.random() * 1200;
    const z = -600 + Math.random() * 1200;

    if (Math.abs(x % 100) < 18 || Math.abs(z % 100) < 18) {
        createTree(x, z);
    }
}

function createCloud(x, y, z) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });

    for (let i = 0; i < 5; i++) {
        const cloud = new THREE.Mesh(new THREE.SphereGeometry(12 + Math.random() * 8, 16, 16), mat);
        cloud.position.set(x + i * 14, y + Math.random() * 5, z + Math.random() * 10);
        scene.add(cloud);
    }
}

for (let i = 0; i < 20; i++) {
    createCloud(-500 + Math.random() * 1000, 220 + Math.random() * 80, -500 + Math.random() * 1000);
}

/* Spider-Man */
let spiderman = null;
let mixer = null;
let walkAction = null;
let idleAction = null;

const clock = new THREE.Clock();
const cameraOffset = new THREE.Vector3(0, 18, 35);
const cameraTarget = new THREE.Vector3();

const loader = new GLTFLoader();

loader.load(
    "./models/spiderman.glb",

    function (gltf) {
        console.log("Spider-Man model loaded successfully");

        spiderman = gltf.scene;

        spiderman.position.set(0, 2, 0);
        spiderman.scale.set(40, 40, 40);
        spiderman.rotation.y = Math.PI;

        spiderman.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(spiderman);

        mixer = new THREE.AnimationMixer(spiderman);

        if (gltf.animations && gltf.animations.length > 0) {
            console.log("Animations found:", gltf.animations.length);

            idleAction = mixer.clipAction(gltf.animations[0]);
            walkAction = mixer.clipAction(gltf.animations[0]);

            idleAction.play();
        } else {
            console.log("No animations found in this GLB model");
        }
    },

    function (xhr) {
        if (xhr.total) {
            console.log("Loading Spider-Man: " + Math.round((xhr.loaded / xhr.total) * 100) + "%");
        }
    },

    function (error) {
        console.error("Model failed to load:", error);
    }
);

const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

function moveSpiderMan() {
    if (!spiderman) return;

    const speed = keys["shift"] ? 2.2 : 1.2;
    let moving = false;

    if (keys["w"]) {
        spiderman.position.z -= speed;
        spiderman.rotation.y = Math.PI;
        moving = true;
    }

    if (keys["s"]) {
        spiderman.position.z += speed;
        spiderman.rotation.y = 0;
        moving = true;
    }

    if (keys["a"]) {
        spiderman.position.x -= speed;
        spiderman.rotation.y = Math.PI / 2;
        moving = true;
    }

    if (keys["d"]) {
        spiderman.position.x += speed;
        spiderman.rotation.y = -Math.PI / 2;
        moving = true;
    }

    if (walkAction) {
        if (moving) {
            walkAction.paused = false;
            walkAction.play();
        } else {
            walkAction.paused = true;
        }
    }

    cameraTarget.set(
        spiderman.position.x,
        spiderman.position.y + 8,
        spiderman.position.z
    );

    const desiredCameraPosition = new THREE.Vector3(
        spiderman.position.x + cameraOffset.x,
        spiderman.position.y + cameraOffset.y,
        spiderman.position.z + cameraOffset.z
    );

    camera.position.lerp(desiredCameraPosition, 0.08);
    controls.target.lerp(cameraTarget, 0.08);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);
    }

    moveSpiderMan();

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

setTimeout(() => {
    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "none";
}, 1000);
