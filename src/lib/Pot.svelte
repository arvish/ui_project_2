<script lang="ts">
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { onMount, onDestroy } from 'svelte';
  import { plantState } from '$lib/plantStore';

  let container: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let ctx: CanvasRenderingContext2D | null = null;
  let texture: THREE.CanvasTexture | null = null;
  let screenMesh: THREE.Mesh | null = null;
  let unsubscribe: () => void;

  let state = {
    moisture: 0.65,
    sunlight: 0.7,
    nutrients: 0.8,
    temperature: 22,
    dayTime: 'Morning'
  };

  // --- Draw dashboard UI onto the texture ---
  function drawScreen() {
    if (!ctx || !texture) return; // safeguard

    const c = ctx; // alias for convenience

    c.clearRect(0, 0, 512, 256);

    // background gradient
    const gradient = c.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, '#001');
    gradient.addColorStop(1, '#012');
    c.fillStyle = gradient;
    c.fillRect(0, 0, 512, 256);

    // title
    c.fillStyle = '#00ffff';
    c.font = 'bold 32px sans-serif';
    c.textAlign = 'center';
    c.fillText('Smart Plant Pot', 256, 40);

    // bar rendering helper
    const drawBar = (label: string, value: number, y: number, color: string) => {
      c.fillStyle = 'white';
      c.font = '20px sans-serif';
      c.textAlign = 'left';
      c.fillText(`${label}: ${(value * 100).toFixed(0)}%`, 40, y);
      c.fillStyle = color;
      c.fillRect(200, y - 15, value * 250, 12);
      c.strokeStyle = '#555';
      c.strokeRect(200, y - 15, 250, 12);
    };

    drawBar('Moisture', state.moisture, 90, '#4cc9f0');
    drawBar('Sunlight', state.sunlight, 130, '#ffdd33');
    drawBar('Nutrients', state.nutrients, 170, '#00ff88');

    // temperature & time
    c.fillStyle = '#fff';
    c.font = '18px monospace';
    c.textAlign = 'center';
    c.fillText(`Temp: ${state.temperature}°C`, 256, 220);
    c.fillText(`Time: ${state.dayTime}`, 256, 245);

    texture.needsUpdate = true;
  }

  onMount(() => {
    // --- Scene setup ---
    scene = new THREE.Scene();
    scene.background = null;

    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const directional = new THREE.DirectionalLight(0xffffff, 1.4);
    directional.position.set(-100, 3, 5);
    scene.add(ambient, directional);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // --- Canvas for the 3D screen ---
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 256;
    const context = screenCanvas.getContext('2d');
    if (!context) {
      console.error('❌ Failed to get 2D context');
      return;
    }
    ctx = context;

    texture = new THREE.CanvasTexture(screenCanvas);

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0xffffff,
      side: THREE.FrontSide,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      depthTest: true,
    });

    // --- Initial draw ---
    drawScreen();

    // --- Load model ---
    const loader = new GLTFLoader();
    loader.load(
      '/smart_pot.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(4, 4, 4);
        model.position.set(0, -0.5, 0);
        scene.add(model);

        screenMesh = model.getObjectByName('ScreenFace') as THREE.Mesh;
        if (screenMesh) {
          screenMesh.material = screenMaterial;
          screenMesh.renderOrder = 2;
          screenMesh.position.z += 0.001;
          console.log('✅ Linked dynamic dashboard to:', screenMesh.name);
        } else {
          console.warn('❌ ScreenFace mesh not found');
        }
      },
      undefined,
      (err) => console.error('Error loading model:', err)
    );

    // --- Subscribe to store updates ---
    unsubscribe = plantState.subscribe((val) => {
      state = val;
      drawScreen();
    });

    // --- Animation loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>

<div bind:this={container} class="viewer"></div>

<style>
  .viewer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 0;
    pointer-events: auto;
  }

  .viewer :global(canvas) {
    width: 100%;
    height: 100%;
    pointer-events: auto;
    cursor: grab;
  }

  :global(.left),
  :global(.sim-controls) {
    position: relative;
    z-index: 2;
  }
</style>
