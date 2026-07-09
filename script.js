/* =============================================================
   SPIDER-MAN 3D CITY GAME
   -------------------------------------------------------------
   A beginner-friendly Three.js game:
     - Builds a small procedural city (roads, sidewalks, buildings
       with glowing windows, street lights, trees, sky, fog).
     - Loads a Spider-Man .glb model with animations.
     - Lets the player walk/run around with WASD + Shift.
     - Follows the player with a smooth third-person camera that
       can also be orbited with the mouse (OrbitControls).
   ============================================================= */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =============================================================
   1. BASIC SCENE SETUP
   ============================================================= */

const container = document.getElementById("game-container");

// The Scene holds every object in our 3D world
const scene = new THREE.Scene();
const SKY_COLOR = 0x87b6d6; // soft dusk-blue sky
scene.background = new THREE.Color(SKY_COLOR);

// Fog makes distant buildings fade out (adds depth + hides pop-in)
scene.fog = new THREE.Fog(SKY_COLOR, 40, 220);

// Camera: field-of-view, aspect ratio, near plane, far plane
const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 6, -10);

// Renderer: draws the scene to a <canvas> which we insert into the page
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // nice soft shadow edges
container.appendChild(renderer.domElement);

/* =============================================================
   2. LIGHTS
   ============================================================= */

// Soft overall light so shadows aren't pitch black
const ambientLight = new THREE.AmbientLight(0x9fb8d9, 0.55);
scene.add(ambientLight);

// Main "sun/moon" light - casts the big directional shadows
const sunLight = new THREE.DirectionalLight(0xfff2d0, 1.1);
sunLight.position.set(-40, 60, -30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -80;
sunLight.shadow.camera.right = 80;
sunLight.shadow.camera.top = 80;
sunLight.shadow.camera.bottom = -80;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 200;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);
scene.add(sunLight.target);

// A cool rim light to give the city a "night patrol" mood
const hemiLight = new THREE.HemisphereLight(0xbfd6ff, 0x223344, 0.4);
scene.add(hemiLight);

/* =============================================================
   3. GROUND, ROADS & SIDEWALKS
   ============================================================= */

const CITY_SIZE = 200; // total ground size

// Base ground plane (grass/dirt color under sidewalks)
const groundGeo = new THREE.PlaneGeometry(CITY_SIZE, CITY_SIZE);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x3d4a3f, roughness: 1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Road running through the middle of the city (asphalt)
const ROAD_WIDTH = 14;
const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, CITY_SIZE);
const roadMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 0.9 });
const road = new THREE.Mesh(roadGeo, roadMat);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01; // slightly above ground to avoid z-fighting
road.receiveShadow = true;
scene.add(road);

// A second road crossing the first, to form an intersection
const crossRoad = road.clone();
crossRoad.rotation.z = Math.PI / 2;
scene.add(crossRoad);

// Dashed lane markings down the middle of the main road
const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x222222 });
for (let z = -CITY_SIZE / 2; z < CITY_SIZE / 2; z += 6) {
  const line = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 3), lineMat);
  line.rotation.x = -Math.PI / 2;
  line.position.set(0, 0.02, z);
  scene.add(line);
}

// Sidewalks on both sides of the main road
const SIDEWALK_WIDTH = 6;
const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xa9a9a4, roughness: 1 });
function createSidewalk(xOffset) {
  const sidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(SIDEWALK_WIDTH, 0.2, CITY_SIZE),
    sidewalkMat
  );
  sidewalk.position.set(xOffset, 0.1, 0);
  sidewalk.receiveShadow = true;
  sidewalk.castShadow = true;
  scene.add(sidewalk);
}
createSidewalk(ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2);
createSidewalk(-(ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2));

/* =============================================================
   4. BUILDINGS (with glowing windows)
   ============================================================= */

// Reusable window material that glows (emissive)
const litWindowMat = new THREE.MeshStandardMaterial({
  color: 0xffdd88,
  emissive: 0xffcc55,
  emissiveIntensity: 1.2,
});
const darkWindowMat = new THREE.MeshStandardMaterial({
  color: 0x222233,
  emissive: 0x111122,
  emissiveIntensity: 0.2,
});

/**
 * Creates one building at (x, z) with the given width/depth/height,
 * and covers its front + back faces with a grid of glowing/dark windows.
 */
function createBuilding(x, z, width, depth, height) {
  const group = new THREE.Group();

  // Main building body
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.6, 0.08, 0.18 + Math.random() * 0.1),
    roughness: 0.85,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMat);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Window grid settings
  const winSize = 0.9;
  const winGapX = 2.2;
  const winGapY = 2.6;
  const cols = Math.max(2, Math.floor(width / winGapX) - 1);
  const rows = Math.max(2, Math.floor(height / winGapY) - 1);

  // Build windows on the two faces that look towards the road (+z and -z)
  [1, -1].forEach((faceDir) => {
    const count = cols * rows;
    // Roughly 40% of windows are lit up at night
    const instancedLit = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(winSize, winSize),
      litWindowMat,
      count
    );
    const instancedDark = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(winSize, winSize),
      darkWindowMat,
      count
    );
    let litIndex = 0;
    let darkIndex = 0;
    const dummy = new THREE.Object3D();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = -width / 2 + winGapX * (c + 1);
        const py = winGapY * (r + 1);
        const pz = (depth / 2 + 0.02) * faceDir;

        dummy.position.set(px, py, pz);
        dummy.rotation.y = faceDir === 1 ? 0 : Math.PI;
        dummy.updateMatrix();

        if (Math.random() < 0.4) {
          instancedLit.setMatrixAt(litIndex++, dummy.matrix);
        } else {
          instancedDark.setMatrixAt(darkIndex++, dummy.matrix);
        }
      }
    }
    // Shrink unused instance slots out of view
    for (let i = litIndex; i < count; i++) {
      dummy.position.set(0, -9999, 0);
      dummy.updateMatrix();
      instancedLit.setMatrixAt(i, dummy.matrix);
    }
    for (let i = darkIndex; i < count; i++) {
      dummy.position.set(0, -9999, 0);
      dummy.updateMatrix();
      instancedDark.setMatrixAt(i, dummy.matrix);
    }

    instancedLit.instanceMatrix.needsUpdate = true;
    instancedDark.instanceMatrix.needsUpdate = true;
    group.add(instancedLit, instancedDark);
  });

  group.position.set(x, 0, z);
  scene.add(group);
}

// Scatter buildings along both sides of the main road
function generateCityBlocks() {
  const rowsOfBuildings = 10;
  const spacing = 18;
  const startZ = -rowsOfBuildings * spacing * 0.5;

  for (let i = 0; i < rowsOfBuildings; i++) {
    const z = startZ + i * spacing + (Math.random() * 4 - 2);
    const width = 8 + Math.random() * 6;
    const depth = 8 + Math.random() * 6;
    const height = 14 + Math.random() * 34;

    const sideOffset = ROAD_WIDTH / 2 + SIDEWALK_WIDTH + width / 2 + 2;
    createBuilding(sideOffset, z, width, depth, height);
    createBuilding(-sideOffset, z, width, depth, height);
  }
}
generateCityBlocks();

/* =============================================================
   5. STREET LIGHTS
   ============================================================= */

function createStreetLight(x, z) {
  const group = new THREE.Group();

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.4 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 5, 8), poleMat);
  pole.position.y = 2.5;
  pole.castShadow = true;
  group.add(pole);

  const armMat = poleMat;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.1), armMat);
  arm.position.set(0.7, 4.9, 0);
  group.add(arm);

  // Glowing lamp head
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffffaa,
    emissive: 0xffe066,
    emissiveIntensity: 1.5,
  });
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), lampMat);
  lamp.position.set(1.3, 4.85, 0);
  group.add(lamp);

  // Real point light so the lamp casts light onto the street
  // (kept to a modest intensity/count for performance)
  const pointLight = new THREE.PointLight(0xffe066, 0.9, 12, 2);
  pointLight.position.copy(lamp.position);
  group.add(pointLight);

  group.position.set(x, 0, z);
  scene.add(group);
}

// Place street lights at intervals along both sidewalks
for (let z = -90; z <= 90; z += 20) {
  createStreetLight(ROAD_WIDTH / 2 + 1, z);
  createStreetLight(-(ROAD_WIDTH / 2 + 1), z);
}

/* =============================================================
   6. TREES
   ============================================================= */

function createTree(x, z) {
  const group = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3a29, roughness: 1 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 2, 8), trunkMat);
  trunk.position.y = 1;
  trunk.castShadow = true;
  group.add(trunk);

  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e5c34, roughness: 1 });
  const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.6, 10), leavesMat);
  leaves.position.y = 3;
  leaves.castShadow = true;
  group.add(leaves);

  group.position.set(x, 0, z);
  scene.add(group);
}

for (let z = -95; z <= 95; z += 12) {
  createTree(ROAD_WIDTH / 2 + SIDEWALK_WIDTH + 1.5, z + 3);
  createTree(-(ROAD_WIDTH / 2 + SIDEWALK_WIDTH + 1.5), z - 3);
}

/* =============================================================
   7. LOADING SCREEN HELPERS
   ============================================================= */

const loadingScreen = document.getElementById("loading-screen");
const loadingProgressText = document.getElementById("loading-progress");

function updateLoadingProgress(percent) {
  loadingProgressText.textContent = `${Math.round(percent)}%`;
}

function hideLoadingScreen() {
  loadingScreen.classList.add("hidden");
}

/* =============================================================
   8. PLAYER (Spider-Man model) + ANIMATIONS
   ============================================================= */

let spiderman = null;          // the loaded model (or fallback mesh)
let mixer = null;              // THREE.AnimationMixer for playing clips
let animationsMap = {};        // name -> THREE.AnimationAction
let currentAction = null;      // action currently playing
const MODEL_PATH = "./models/spiderman.glb";

// Group that we actually move around the world.
// The model gets nested inside so we can fix its scale/offset
// without that fighting our movement code.
const playerRig = new THREE.Group();
playerRig.position.set(0, 0, -6); // start a little way down the road
scene.add(playerRig);

/**
 * Cross-fades smoothly from whichever animation is currently playing
 * to the requested one. Safe to call every frame; it only fades if
 * the target action is different from the current one.
 */
function playAnimation(name) {
  if (!mixer) return;
  const nextAction = animationsMap[name];
  if (!nextAction || nextAction === currentAction) return;

  if (currentAction) {
    currentAction.fadeOut(0.25);
  }
  nextAction.reset().fadeIn(0.25).play();
  currentAction = nextAction;
}

/**
 * Looks for an animation clip whose name loosely matches one of the
 * given keywords (case-insensitive). GLB files name clips differently
 * ("Idle", "idle_01", "mixamo.com|Idle", etc.) so we search loosely.
 */
function findClipName(clips, keywords) {
  const match = clips.find((clip) =>
    keywords.some((kw) => clip.name.toLowerCase().includes(kw))
  );
  return match ? match.name : null;
}

/**
 * Builds a simple fallback character (capsule body) in case the
 * spiderman.glb file is missing or fails to load. This keeps the
 * game playable even before you've added the real model.
 */
function createFallbackCharacter() {
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc1122, roughness: 0.6 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.0, 4, 8), bodyMat);
  body.position.y = 1.0;
  body.castShadow = true;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), headMat);
  head.position.y = 1.85;
  head.castShadow = true;

  const fallback = new THREE.Group();
  fallback.add(body, head);
  return fallback;
}

const gltfLoader = new GLTFLoader();

gltfLoader.load(
  MODEL_PATH,

  // ---------- onLoad ----------
  (gltf) => {
    spiderman = gltf.scene;

    // Correct scale / position / rotation
    // (tweak SPIDERMAN_SCALE if your model looks too big/small)
    const SPIDERMAN_SCALE = 2.0;
    spiderman.scale.setScalar(SPIDERMAN_SCALE);
    spiderman.position.set(0, 0, 0);   // sits at the feet of the rig
    spiderman.rotation.y = Math.PI;    // face away from camera (forward = -z)

    spiderman.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    playerRig.add(spiderman);

    // ---- Animation setup ----
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(spiderman);

      gltf.animations.forEach((clip) => {
        animationsMap[clip.name] = mixer.clipAction(clip);
      });

      // Try to guess which clips are idle / walk / run
      const idleName = findClipName(gltf.animations, ["idle", "stand"]);
      const walkName = findClipName(gltf.animations, ["walk"]);
      const runName = findClipName(gltf.animations, ["run", "sprint"]);

      // Store resolved names (fallback to the first clip if we can't match)
      animationsMap.__idle = animationsMap[idleName] || Object.values(animationsMap)[0];
      animationsMap.__walk = animationsMap[walkName] || animationsMap.__idle;
      animationsMap.__run = animationsMap[runName] || animationsMap.__walk;

      playAnimation("__idle");
    } else {
      // Requirement #7: warn clearly if the GLB has no animations
      console.warn("No animations found in this GLB model");
    }

    hideLoadingScreen();
  },

  // ---------- onProgress ----------
  (xhr) => {
    if (xhr.lengthComputable) {
      updateLoadingProgress((xhr.loaded / xhr.total) * 100);
    }
  },

  // ---------- onError ----------
  (error) => {
    console.error("Failed to load spiderman.glb - using fallback character.", error);
    console.warn("No animations found in this GLB model");
    spiderman = createFallbackCharacter();
    playerRig.add(spiderman);
    hideLoadingScreen();
  }
);

/* =============================================================
   9. KEYBOARD INPUT
   ============================================================= */

const keysPressed = { w: false, a: false, s: false, d: false, shift: false };

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "w" || key === "a" || key === "s" || key === "d") keysPressed[key] = true;
  if (key === "shift") keysPressed.shift = true;
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key === "w" || key === "a" || key === "s" || key === "d") keysPressed[key] = false;
  if (key === "shift") keysPressed.shift = false;
});

/* =============================================================
   10. THIRD-PERSON CAMERA (OrbitControls following the player)
   -------------------------------------------------------------
   Trick: instead of manually moving the camera every frame (which
   easily causes jitter/shake), we let OrbitControls keep the same
   *relative offset* it already has, and each frame we simply move
   its "target" to the player's position. Because OrbitControls
   recalculates the camera from target + offset, the camera glides
   along with the player automatically and smoothly, while the
   player can still drag with the mouse to look around.
   ============================================================= */

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;      // adds smoothing to mouse orbit
controls.dampingFactor = 0.08;
controls.enablePan = false;         // don't let the player pan away from Spider-Man
controls.minDistance = 4;
controls.maxDistance = 14;
controls.maxPolarAngle = Math.PI * 0.49; // stop camera from flipping under the ground
controls.target.copy(playerRig.position).add(new THREE.Vector3(0, 1.6, 0));
controls.update();

// Give the camera a nice starting "behind the shoulder" position
camera.position.copy(playerRig.position).add(new THREE.Vector3(0, 4, -8));

/* =============================================================
   11. MOVEMENT LOGIC
   ============================================================= */

const WALK_SPEED = 3.2;   // units per second
const RUN_SPEED = 7.0;    // units per second
const ROTATE_LERP = 0.18; // how quickly the character turns to face movement

const moveDirection = new THREE.Vector3();
const cameraForward = new THREE.Vector3();
const cameraRight = new THREE.Vector3();
const targetQuaternion = new THREE.Quaternion();
const upVector = new THREE.Vector3(0, 1, 0);

function updatePlayerMovement(delta) {
  // Figure out which way is "forward"/"right" from the camera's
  // current horizontal facing, so WASD always feels intuitive
  // no matter how the player has orbited the camera.
  camera.getWorldDirection(cameraForward);
  cameraForward.y = 0;
  cameraForward.normalize();
  cameraRight.crossVectors(cameraForward, upVector).normalize();

  moveDirection.set(0, 0, 0);
  if (keysPressed.w) moveDirection.add(cameraForward);
  if (keysPressed.s) moveDirection.sub(cameraForward);
  if (keysPressed.d) moveDirection.add(cameraRight);
  if (keysPressed.a) moveDirection.sub(cameraRight);

  const isMoving = moveDirection.lengthSq() > 0.0001;

  if (isMoving) {
    moveDirection.normalize();

    const speed = keysPressed.shift ? RUN_SPEED : WALK_SPEED;
    playerRig.position.addScaledVector(moveDirection, speed * delta);

    // Smoothly rotate the character to face the direction it's moving
    const lookTarget = new THREE.Vector3().copy(playerRig.position).add(moveDirection);
    const tempMatrix = new THREE.Matrix4().lookAt(
      lookTarget,
      playerRig.position,
      upVector
    );
    targetQuaternion.setFromRotationMatrix(tempMatrix);
    playerRig.quaternion.slerp(targetQuaternion, ROTATE_LERP);

    playAnimation(keysPressed.shift ? "__run" : "__walk");
  } else {
    playAnimation("__idle");
  }

  // Keep the player roughly within the city bounds
  const half = CITY_SIZE / 2 - 4;
  playerRig.position.x = THREE.MathUtils.clamp(playerRig.position.x, -half, half);
  playerRig.position.z = THREE.MathUtils.clamp(playerRig.position.z, -half, half);
}

/* =============================================================
   12. RESPONSIVE RESIZE
   ============================================================= */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =============================================================
   13. MAIN ANIMATION LOOP
   ============================================================= */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1); // clamp to avoid big jumps on tab-switch

  updatePlayerMovement(delta);

  // Move the OrbitControls target to follow the player (see section 10)
  const desiredTarget = new THREE.Vector3()
    .copy(playerRig.position)
    .add(new THREE.Vector3(0, 1.6, 0));
  controls.target.lerp(desiredTarget, 0.18);
  controls.update();

  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}

animate();

/* =============================================================
   SAFETY NET: if for some reason loading events never fire
   (e.g. browser blocks the file), hide the loading screen after
   a few seconds anyway so the player isn't stuck staring at it.
   ============================================================= */
setTimeout(() => {
  if (!loadingScreen.classList.contains("hidden")) {
    hideLoadingScreen();
  }
}, 8000);
