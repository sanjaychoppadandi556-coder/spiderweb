import * as THREE from "three";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 120, 900);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);

camera.position.set(80, 80, 120);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 2.8);
sun.position.set(100, 220, 120);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
scene.add(sun);

const groundGeometry = new THREE.PlaneGeometry(1200, 1200);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f8f46,
    roughness: 0.8
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.7
});

const buildingMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.65 }),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.65 }),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65 }),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.65 }),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.65 })
];

const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff2a8,
    emissive: 0xffcc55,
    emissiveIntensity: 0.45
});

function createRoad(width, length, x, z, rotate = false) {
    const geo = new THREE.BoxGeometry(width, 0.12, length);
    const road = new THREE.Mesh(geo, roadMaterial);
    road.position.set(x, 0.04, z);

    if (rotate) {
        road.rotation.y = Math.PI / 2;
    }

    road.receiveShadow = true;
    scene.add(road);
}

for (let i = -500; i <= 500; i += 100) {
    createRoad(18, 1100, i, 0, false);
    createRoad(18, 1100, 0, i, true);
}

function createBuilding(x, z, width, depth, height) {
    const mat = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];

    const geo = new THREE.BoxGeometry(width, height, depth);
    const building = new THREE.Mesh(geo, mat);

    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);

    createWindows(building, width, depth, height);
}

function createWindows(building, width, depth, height) {
    const rows = Math.floor(height / 10);
    const colsFront = Math.floor(width / 8);
    const colsSide = Math.floor(depth / 8);

    for (let r = 1; r < rows; r++) {
        for (let c = 0; c < colsFront; c++) {
            if (Math.random() > 0.35) {
                const win = new THREE.Mesh(
                    new THREE.PlaneGeometry(2.2, 3.2),
                    windowMaterial
                );

                win.position.set(
                    building.position.x - width / 2 + 5 + c * 8,
                    r * 8,
                    building.position.z + depth / 2 + 0.06
                );

                scene.add(win);
            }
        }

        for (let c = 0; c < colsSide; c++) {
            if (Math.random() > 0.45) {
                const win = new THREE.Mesh(
                    new THREE.PlaneGeometry(2.2, 3.2),
                    windowMaterial
                );

                win.position.set(
                    building.position.x + width / 2 + 0.06,
                    r * 8,
                    building.position.z - depth / 2 + 5 + c * 8
                );

                win.rotation.y = Math.PI / 2;
                scene.add(win);
            }
        }
    }
}

for (let x = -450; x <= 450; x += 100) {
    for (let z = -450; z <= 450; z += 100) {
        if (Math.abs(x) < 60 && Math.abs(z) < 60) continue;

        const buildingCount = 2 + Math.floor(Math.random() * 3);

        for (let i = 0; i < buildingCount; i++) {
            const offsetX = -25 + Math.random() * 50;
            const offsetZ = -25 + Math.random() * 50;

            const width = 20 + Math.random() * 25;
            const depth = 20 + Math.random() * 25;
            const height = 35 + Math.random() * 140;

            createBuilding(x + offsetX, z + offsetZ, width, depth, height);
        }
    }
}

function createCenterTower() {
    const geo = new THREE.BoxGeometry(45, 220, 45);
    const tower = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
            color: 0x111827,
            roughness: 0.5
        })
    );

    tower.position.set(0, 110, -140);
    tower.castShadow = true;
    tower.receiveShadow = true;
    scene.add(tower);

    createWindows(tower, 45, 45, 220);
}

createCenterTower();

function animate() {
    requestAnimationFrame(animate);

    camera.position.x = Math.sin(Date.now() * 0.00012) * 140;
    camera.position.z = Math.cos(Date.now() * 0.00012) * 180;
    camera.lookAt(0, 50, 0);

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
