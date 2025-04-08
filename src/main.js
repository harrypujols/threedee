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

/**
 * Add orbit controls for camera manipulation
 * @type {OrbitControls}
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Set the initial target for OrbitControls
controls.target.set(0.0, 0.0, 0.0); // Your specified target
controls.update(); // Important: call this after changing target

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

    // Center the geometry
    geometry.computeBoundingBox();
    /** @type {THREE.Vector3} */
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    geometry.center();

    // Scale the model to fit the view
    /** @type {THREE.Box3} */
    const box = new THREE.Box3().setFromObject(mesh);
    /** @type {THREE.Vector3} */
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxSize;
    mesh.scale.multiplyScalar(scale);

    // Rotate to better viewing angle
    mesh.rotation.x = -Math.PI / 2;

    scene.add(mesh);
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
  controls.update();
  renderer.render(scene, camera);
}

animate();
