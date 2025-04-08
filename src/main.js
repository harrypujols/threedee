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
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near plane
  1000 // Far plane
);
camera.position.z = 5;

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
