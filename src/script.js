import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import coffeeSmokeVertexShader from "./shaders/coffeeSmoke/vertex.glsl";
import coffeeSmokeFragmentShader from "./shaders/coffeeSmoke/fragment.glsl";

/**
 * Additions:
 *  Tweaks for Fragment pattern, vertex animation, color (COMPLETE)
 *  Bring in own model
 *    Motherboard (from Daniel Cardona: https://sketchfab.com/3d-models/motherboard-components-3bc94057328243d4b341a55f59160f8a)
 *    Floating Marshmallows (made own in blender)
 *  Make cursor move the smoke (wind effect) (would want update in future)
 */

// Function to view object names of imported model
function logObjectNames(object, prefix = "") {
  console.log(`${prefix}${object.name}`);
  object.children.forEach((child) => logObjectNames(child, `${prefix}- `));
}

// Animate floating marshmallows
function animateMarsh(mesh, initialPosition) {
  // Speed of bobbing
  const speed = 0.01;
  // Heigh of bobbing
  const amplitude = 0.005;
  // Speed of rotation
  const rotationSpeed = 0.001;

  let time = 0;

  const animate = () => {
    time += speed;
    const y = initialPosition.y + Math.sin(time) * amplitude;
    mesh.position.setY(y);

    // Rotate
    mesh.rotation.x += rotationSpeed;
    mesh.rotation.y += rotationSpeed;
    mesh.rotation.z += rotationSpeed;

    requestAnimationFrame(animate);
  };

  animate();
}

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

/**
 * Lighting
 */
// Create an ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 5); // White light with full intensity

// Add the ambient light to the scene
scene.add(ambientLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
// Could also try Y = 24
camera.position.set(10, 10, 22);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Textures
 */
const bakedTexture = textureLoader.load("baked.jpg");
// Fixes initial load error
bakedTexture.flipY = false;

// Fixes encoding sRGB (now it uses color space)`
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

/**
 * Model
 */
// gltfLoader.load("./bakedModel.glb", (gltf) => {
//   gltf.scene.getObjectByName("baked").material.map.anisotropy = 8;
//   scene.add(gltf.scene);
// });

// Load my Motherboard
gltfLoader.load("./motherboard__components.glb", (gltf) => {
  // Log the object names to the console
  // logObjectNames(gltf.scene);

  // Sizing / Positioning
  // gltf.scene.scale.set(0.5, 0.5, 0.5);
  gltf.scene.rotateX(-Math.PI / 2);

  gltf.scene.position.y = 8;

  // Add the loaded scene to your main scene (loading all so nothing specific needed)
  scene.add(gltf.scene);
});

// Load Marshmallow 1
gltfLoader.load("Marshmallows.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedMaterial;
  });

  gltf.scene.scale.set(0.3, 0.3, 0.3);
  gltf.scene.rotateZ(-Math.PI / 4);
  gltf.scene.position.set(-5, 5, 0);

  // Start animation
  animateMarsh(gltf.scene, gltf.scene.position);

  scene.add(gltf.scene);
});

// Load Marshmallow 2
gltfLoader.load("Marshmallows.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedMaterial;
  });

  gltf.scene.scale.set(0.3, 0.3, 0.3);
  gltf.scene.rotateX((3 * Math.PI) / 4);
  gltf.scene.position.set(-3, 6, -5);

  // Start animation
  animateMarsh(gltf.scene, gltf.scene.position);

  scene.add(gltf.scene);
});

// Load Marshmallow 3
gltfLoader.load("Marshmallows.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedMaterial;
  });

  gltf.scene.scale.set(0.3, 0.3, 0.3);
  gltf.scene.rotateZ(Math.PI / 4);
  gltf.scene.position.set(6, 2, 0);

  // Start animation
  animateMarsh(gltf.scene, gltf.scene.position);

  scene.add(gltf.scene);
});

// Load Burned Marshmallow
gltfLoader.load("Marshmallow Burned.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedMaterial;
  });

  gltf.scene.scale.set(0.3, 0.3, 0.3);
  gltf.scene.rotateZ(-Math.PI / 2);

  gltf.scene.position.set(0.2, 0.65, -1);

  scene.add(gltf.scene);
});

/**
 * Smoke
 */
// Geometry (focus on shape and structure)
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
smokeGeometry.translate(0, 0.5, 0);
smokeGeometry.scale(1.0, 6, 1.0);

// Perlin texture
const perlinTexture = textureLoader.load("./perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

// ---------- Controls START ----------
/**
 * Smoke Intensity (when dealing with changing values be sure to do an onChange)
 * Two forms below
 */
// Default 0.4
const smokeIntensity = { smokeInt: 0.4 };

// gui.add(smokeIntensity, "smokeInt", 0, 0.6, 0.01).onChange((value) => {
//   smokeMaterial.uniforms.uSmokeInt.value = value;
// });

gui
  .add(smokeIntensity, "smokeInt")
  .min(0)
  .max(0.6)
  .step(0.01)
  .onChange((value) => {
    smokeMaterial.uniforms.uSmokeInt.value = value;
  });

/**
 * Smoke Angle
 */
// Default 10.0
const smokeAngle = { smokeAng: 32.0 };

gui
  .add(smokeAngle, "smokeAng")
  .min(0)
  .max(100.0)
  .step(1)
  .onChange((value) => {
    smokeMaterial.uniforms.uSmokeAng.value = value;
  });

/**
 * Smoke Color
 */
const smokeColor = {
  smokeC: { r: 0.976, g: 0.976, b: 0.976 },
};
gui.addColor(smokeColor, "smokeC").onChange((value) => {
  smokeMaterial.uniforms.uSmokeC.value = value;
});
// ---------- Controls END ----------

// Material
const smokeMaterial = new THREE.ShaderMaterial({
  vertexShader: coffeeSmokeVertexShader,
  fragmentShader: coffeeSmokeFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uPerlinTexture: new THREE.Uniform(perlinTexture),
    uSmokeInt: new THREE.Uniform(smokeIntensity.smokeInt),
    uSmokeAng: new THREE.Uniform(smokeAngle.smokeAng),
    uSmokeC: new THREE.Uniform(
      new THREE.Color(
        smokeColor.smokeC.r,
        smokeColor.smokeC.g,
        smokeColor.smokeC.b
      )
    ),
    uWindSpeed: new THREE.Uniform(new THREE.Vector2(0, 0)),
  },
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
  wireframe: true,
});

// Mesh (object on 3D scene [position, rotation, scale])
const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
smoke.position.set(0.68, 0.5, -1.85);

// 45 degree roration on smoke
smoke.rotation.set(0, Math.PI / 4, 0);

scene.add(smoke);

/**
 * Mouse Hover Effect
 */
// Define a scaling factor
const windSpeedScale = 8.0;

// Define a damping factor for gradual reset
const dampingFactor = 0.95;

// Mouse Hover Effect
let mouse = new THREE.Vector2();
let targetWindSpeed = new THREE.Vector2();
let currentWindSpeed = new THREE.Vector2();

canvas.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;

  // Scale the mouse coordinates to intensify the wind effect
  targetWindSpeed.x =
    Math.sign(mouse.x) * Math.pow(Math.abs(mouse.x), 1.5) * windSpeedScale;
  targetWindSpeed.y =
    Math.sign(mouse.y) * Math.pow(Math.abs(mouse.y), 1.5) * windSpeedScale;
});

const raycaster = new THREE.Raycaster();

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update smoke
  smokeMaterial.uniforms.uTime.value = elapsedTime;

  // Handle Raycaster and mouse movement
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([smoke]);

  if (intersects.length > 0) {
    // Apply wind effect when the mouse is over the smoke
    currentWindSpeed.lerp(targetWindSpeed, 0.1);
  } else {
    // Gradually reset wind speed when the mouse is not over the smoke
    currentWindSpeed.multiplyScalar(dampingFactor);
  }

  smokeMaterial.uniforms.uWindSpeed.value.copy(currentWindSpeed);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
