import "./styles.css";
import * as THREE from "three";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Load settings
async function loadSettings() {
  const response = await fetch("/src/settings.json");
  return await response.json();
}

loadSettings().then((settings) => {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    settings.camera.fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(
    settings.camera.position.x,
    settings.camera.position.y,
    settings.camera.position.z
  );
  camera.rotation.set(
    settings.camera.rotation.x,
    settings.camera.rotation.y,
    settings.camera.rotation.z
  );

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const meshContainer = new THREE.Group();
  meshContainer.position.set(
    settings.rotation.axisOffset.x,
    settings.rotation.axisOffset.y,
    settings.rotation.axisOffset.z
  );
  meshContainer.rotation.y = THREE.MathUtils.degToRad(
    settings.rotation.yRotation
  );
  scene.add(meshContainer);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0.0, 0.0, 0.0);

  let isRotating = true;
  const rotationSpeed = settings.rotation.speed;

  window.addEventListener("keydown", (event) => {
    if (event.key === "r" || event.key === "R") {
      isRotating = !isRotating;
      console.log("Rotation:", isRotating ? "ON" : "OFF");
    }
  });

  const loader = new PLYLoader();
  loader.load(
    settings.mesh.filePath,
    (geometry) => {
      geometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: false,
        roughness: 0.5,
        metalness: 0.0,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Center the geometry
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      geometry.center();

      // Scale the mesh
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      const scale = settings.mesh.scaleFactor / maxSize;
      mesh.scale.multiplyScalar(scale);

      mesh.rotation.set(
        settings.mesh.initialRotation.x,
        settings.mesh.initialRotation.y,
        settings.mesh.initialRotation.z
      );

      meshContainer.add(mesh);

      controls.target.copy(meshContainer.position);
      controls.update();
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("Error loading PLY file:", error);
    }
  );

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    if (isRotating) {
      meshContainer.rotation.y += rotationSpeed;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
});
