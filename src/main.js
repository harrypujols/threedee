import * as THREE from "three";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/** @type {THREE.Scene} */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

/**
 * Create perspective camera
 * @type {THREE.PerspectiveCamera}
 */
const camera = new THREE.PerspectiveCamera(
  75, // Your specified FOV: 75.000
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near plane
  1000 // Far plane
);

// Set the initial camera position
camera.position.set(-0.521, -0.073, 0.948); // Your specified position
camera.rotation.set(0.077, -0.502, 0.037); // Your specified rotation

/**
 * Create WebGL renderer with antialiasing
 * @type {THREE.WebGLRenderer}
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

/**
 * Add ambient light for general illumination
 * @type {THREE.AmbientLight}
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

/**
 * Add directional light for shadows and depth
 * @type {THREE.DirectionalLight}
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add world axes helper
const worldAxesHelper = new THREE.AxesHelper(1);
worldAxesHelper.material.linewidth = 2;
scene.add(worldAxesHelper);

// Create a container for the mesh
const meshContainer = new THREE.Group();
meshContainer.position.x = 0.3; // Updated from 0.25 to 0.3 (30% to the right)
meshContainer.rotation.y = THREE.MathUtils.degToRad(85);

// Add local axes helper to the container
const localAxesHelper = new THREE.AxesHelper(0.5);
localAxesHelper.material.linewidth = 2;
meshContainer.add(localAxesHelper);

scene.add(meshContainer);

// Add axis labels
const createAxisLabel = (text, position, color) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 64;
  canvas.height = 32;
  context.fillStyle = color;
  context.font = "24px Arial";
  context.fillText(text, 0, 24);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.copy(position);
  sprite.scale.set(0.1, 0.05, 1);
  return sprite;
};

// Add world axis labels
scene.add(createAxisLabel("X", new THREE.Vector3(1.1, 0, 0), "#ff0000"));
scene.add(createAxisLabel("Y", new THREE.Vector3(0, 1.1, 0), "#00ff00"));
scene.add(createAxisLabel("Z", new THREE.Vector3(0, 0, 1.1), "#0000ff"));

/**
 * Add orbit controls for camera manipulation
 * @type {OrbitControls}
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0.0, 0.0, 0.0);

// Variable to control rotation
let isRotating = true;
const rotationSpeed = 0.01; // Adjust this value to change rotation speed

// Add keyboard controls for axis visibility
let axesVisible = true;

// Add event listener for control changes
controls.addEventListener("change", () => {
  // Log camera position and zoom info
  console.log("Camera Position:", {
    x: camera.position.x.toFixed(3),
    y: camera.position.y.toFixed(3),
    z: camera.position.z.toFixed(3),
  });

  // Log camera rotation
  console.log("Camera Rotation:", {
    x: camera.rotation.x.toFixed(3),
    y: camera.rotation.y.toFixed(3),
    z: camera.rotation.z.toFixed(3),
  });

  // Log controls target (what the camera is looking at)
  console.log("Controls Target:", {
    x: controls.target.x.toFixed(3),
    y: controls.target.y.toFixed(3),
    z: controls.target.z.toFixed(3),
  });

  // Log camera field of view
  console.log("Camera FOV:", camera.fov.toFixed(3));
});

// Add key command to save position
window.addEventListener("keydown", (event) => {
  if (event.key === "s" || event.key === "S") {
    console.log("\nCamera Setup Configuration:");
    console.log(
      `camera.position.set(${camera.position.x.toFixed(
        3
      )}, ${camera.position.y.toFixed(3)}, ${camera.position.z.toFixed(3)});`
    );
    console.log(
      `camera.rotation.set(${camera.rotation.x.toFixed(
        3
      )}, ${camera.rotation.y.toFixed(3)}, ${camera.rotation.z.toFixed(3)});`
    );
    console.log(
      `controls.target.set(${controls.target.x.toFixed(
        3
      )}, ${controls.target.y.toFixed(3)}, ${controls.target.z.toFixed(3)});`
    );
    console.log(`camera.fov = ${camera.fov.toFixed(3)};`);
    console.log(`\nContainer Configuration:`);
    console.log(
      `meshContainer.position.x = ${meshContainer.position.x.toFixed(3)};`
    );
    console.log(
      `meshContainer.rotation.y = ${meshContainer.rotation.y.toFixed(
        3
      )}; // ${THREE.MathUtils.radToDeg(meshContainer.rotation.y).toFixed(
        1
      )} degrees`
    );
  }
  if (event.key === "r" || event.key === "R") {
    isRotating = !isRotating;
    console.log("Rotation:", isRotating ? "ON" : "OFF");
  }
  if (event.key === "a" || event.key === "A") {
    axesVisible = !axesVisible;
    worldAxesHelper.visible = axesVisible;
    localAxesHelper.visible = axesVisible;
    console.log("Axes:", axesVisible ? "ON" : "OFF");
  }
  // Add arrow key controls for fine-tuning the rotation axis
  if (event.key === "ArrowRight") {
    meshContainer.position.x += 0.1;
    console.log("Container X position:", meshContainer.position.x.toFixed(3));
  }
  if (event.key === "ArrowLeft") {
    meshContainer.position.x -= 0.1;
    console.log("Container X position:", meshContainer.position.x.toFixed(3));
  }
  // Add controls for Y rotation adjustment
  if (event.key === "ArrowUp") {
    meshContainer.rotation.y += THREE.MathUtils.degToRad(5);
    console.log(
      "Container Y rotation (degrees):",
      THREE.MathUtils.radToDeg(meshContainer.rotation.y).toFixed(1)
    );
  }
  if (event.key === "ArrowDown") {
    meshContainer.rotation.y -= THREE.MathUtils.degToRad(5);
    console.log(
      "Container Y rotation (degrees):",
      THREE.MathUtils.radToDeg(meshContainer.rotation.y).toFixed(1)
    );
  }
});

/**
 * Load and process PLY file
 * @type {PLYLoader}
 */
const loader = new PLYLoader();
loader.load(
  "./harry.ply",
  /**
   * Success callback - creates and adds mesh to scene
   * @param {THREE.BufferGeometry} geometry - The loaded PLY geometry
   */
  (geometry) => {
    // Enable vertex colors and compute normals
    geometry.computeVertexNormals();

    // Compute the bounding box before creating the mesh
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    geometry.center();

    /**
     * Create material with vertex colors enabled
     * @type {THREE.MeshStandardMaterial}
     */
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: false,
      roughness: 0.5,
      metalness: 0.0,
    });

    /**
     * Create mesh with geometry and material
     * @type {THREE.Mesh}
     */
    const mesh = new THREE.Mesh(geometry, material);

    // Scale the model to fit the view
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxSize;
    mesh.scale.multiplyScalar(scale);

    // Rotate to better viewing angle
    mesh.rotation.x = -Math.PI / 2;

    // Add mesh to the container instead of directly to the scene
    meshContainer.add(mesh);

    // Update controls target to match container position
    controls.target.copy(meshContainer.position);
    controls.update();
  },
  /**
   * Progress callback
   * @param {ProgressEvent} xhr - Progress event
   */
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  /**
   * Error callback
   * @param {Error} error - Error object
   */
  (error) => {
    console.error("Error loading PLY file:", error);
  }
);

/**
 * Handle window resize
 * Updates camera aspect ratio and renderer size
 */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/**
 * Animation loop
 * Updates controls and renders scene
 */
function animate() {
  requestAnimationFrame(animate);

  // Rotate the mesh container if rotation is enabled
  if (isRotating) {
    meshContainer.rotation.y += rotationSpeed;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
