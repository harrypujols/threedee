import "./styles.css";
import * as THREE from "three";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";

/** @type {THREE.Scene} */
const scene = new THREE.Scene();

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
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false, // Changed to false since we don't need transparency
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x111111); // Set to match body background
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

// Create a container for the mesh
const meshContainer = new THREE.Group();
meshContainer.position.x = 0.3; // Updated from 0.25 to 0.3 (30% to the right)
meshContainer.rotation.y = THREE.MathUtils.degToRad(85);
scene.add(meshContainer);

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

// Keep track of the current mesh
let currentMesh = null;
const modifier = new SimplifyModifier();

// Function to create a mesh with a specific detail level
function createOptimizedMesh(geometry, detailLevel) {
  // Clone the geometry to avoid modifying the original
  const workingGeometry = geometry.clone();

  // Calculate target number of vertices
  const targetVertices = Math.floor(
    geometry.attributes.position.count * detailLevel
  );

  try {
    // Only optimize if we're reducing vertices
    if (targetVertices < geometry.attributes.position.count) {
      const simplified = modifier.modify(workingGeometry, targetVertices);
      simplified.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: false,
        roughness: 0.5,
        metalness: 0.0,
      });

      return new THREE.Mesh(simplified, material);
    }
  } catch (error) {
    console.error("Optimization failed:", error);
  }

  // Return mesh with original geometry if optimization fails or isn't needed
  return new THREE.Mesh(
    workingGeometry,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: false,
      roughness: 0.5,
      metalness: 0.0,
    })
  );
}

// Function to update mesh with new detail level
function updateMeshDetail(originalGeometry, detailLevel) {
  if (currentMesh) {
    meshContainer.remove(currentMesh);
  }

  const newMesh = createOptimizedMesh(originalGeometry, detailLevel);

  // Center and scale the mesh
  newMesh.geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  newMesh.geometry.boundingBox.getCenter(center);
  newMesh.geometry.center();

  const box = new THREE.Box3().setFromObject(newMesh);
  const size = box.getSize(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxSize;
  newMesh.scale.multiplyScalar(scale);

  newMesh.rotation.x = -Math.PI / 2;

  meshContainer.add(newMesh);
  currentMesh = newMesh;

  // Log statistics
  console.log(`Detail Level ${detailLevel * 100}%:`, {
    vertices: newMesh.geometry.attributes.position.count,
    triangles: newMesh.geometry.index ? newMesh.geometry.index.count / 3 : 0,
  });
}

// Store the original geometry for optimization
let originalGeometry = null;

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
    geometry.computeVertexNormals();
    originalGeometry = geometry.clone();

    // Log original stats
    console.log("Original geometry:", {
      vertices: geometry.attributes.position.count,
      triangles: geometry.index ? geometry.index.count / 3 : 0,
    });

    // Create initial mesh at 100% detail
    updateMeshDetail(geometry, 1.0);

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

// Add keyboard controls for optimization levels
window.addEventListener("keydown", (event) => {
  if (event.key === "r" || event.key === "R") {
    isRotating = !isRotating;
    console.log("Rotation:", isRotating ? "ON" : "OFF");
  }
  // Number keys 1-9 for different optimization levels
  if (originalGeometry && event.key >= "1" && event.key <= "9") {
    const detailLevel = parseInt(event.key) / 10;
    updateMeshDetail(originalGeometry, detailLevel);
  }
  // 0 key for full detail
  if (originalGeometry && event.key === "0") {
    updateMeshDetail(originalGeometry, 1.0);
  }
});

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
