<script lang="ts">
  import * as THREE from "three";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { onMount, onDestroy } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicInOut } from "svelte/easing";
  import { plantState } from "$lib/plantStore";

  // --- Scene state ---
  let container: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let ctx: CanvasRenderingContext2D | null = null;
  let texture: THREE.CanvasTexture | null = null;
  let screenMesh: THREE.Mesh | null = null;
  let unsubscribe: () => void;

  // --- Animated values ---
  const smoothMoisture = tweened(0.65, { duration: 800, easing: cubicInOut });
  const smoothSunlight = tweened(0.7, { duration: 800, easing: cubicInOut });
  const smoothNutrients = tweened(0.8, { duration: 800, easing: cubicInOut });

  // --- Local data (temp, time) ---
  let temp = 22;
  let dayTime = "Morning";
  let tempBounds = { min: 18, max: 28 };

  // --- Draw the dashboard ---
  function drawScreen(moisture: number, sunlight: number, nutrients: number) {
    if (!ctx || !texture) return;
    const c = ctx;
    c.clearRect(0, 0, 512, 256);

    // Background
    const gradient = c.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, "#001");
    gradient.addColorStop(1, "#012");
    c.fillStyle = gradient;
    c.fillRect(0, 0, 512, 256);

    // ----- Moisture (left column) -----
    const dropletCount = 5;
    const dropletSize = 22;
    const gap = 8;
    const topX = 50;
    const topY = 60;
    const totalHeight = dropletCount * (dropletSize + gap);

    const totalFill = moisture * dropletCount;

    for (let i = 0; i < dropletCount; i++) {
      const index = dropletCount - 1 - i;
      const y = topY + i * (dropletSize + gap);
      const fillFraction = Math.min(Math.max(totalFill - index, 0), 1);
      const color = moisture > 0.3 ? "#4cc9f0" : "#ff4b4b";

      drawDroplet(c, topX, y, dropletSize, fillFraction, color);
    }

    // ----- Nutrients (right column) -----
    const pebbleCount = 5;
    const pebbleX = 120;
    const pebbleSize = 22;
    const pebbleGap = 8;
    const totalNFill = nutrients * pebbleCount;

    for (let i = 0; i < pebbleCount; i++) {
      const index = pebbleCount - 1 - i; // top → bottom depletion
      const y = topY + i * (pebbleSize + pebbleGap);
      const fillFraction = Math.min(Math.max(totalNFill - index, 0), 1);
      const color = nutrients > 0.3 ? "#00ff88" : "#ff4b4b";
      drawPebble(c, pebbleX, y, pebbleSize, fillFraction, color);
    }


    // ----- Sunlight bar -----
    c.fillStyle = "white";
    c.font = "20px sans-serif";
    c.textAlign = "left";
    c.fillText(`Sunlight`, 40, 240);
    c.fillStyle = "#ffdd33";
    c.fillRect(160, 225, sunlight * 280, 14);
    c.strokeStyle = "#555";
    c.strokeRect(160, 225, 280, 14);

    // ----- Temperature (top-right corner) -----
    const barX = 330;
    const barY = 40;
    const barWidth = 160;
    const barHeight = 8;

    const tempMin = 0;
    const tempMax = 40;
    const normalizedTemp = (temp - tempMin) / (tempMax - tempMin);
    const tempX = barX + normalizedTemp * barWidth;

    const idealMinX = barX + (tempBounds.min / (tempMax - tempMin)) * barWidth;
    const idealMaxX = barX + (tempBounds.max / (tempMax - tempMin)) * barWidth;

    const isIdeal = temp >= tempBounds.min && temp <= tempBounds.max;
    const tempColor = isIdeal ? "#00ff88" : "#ff4b4b";

    c.fillStyle = "#111";
    c.fillRect(barX, barY, barWidth, barHeight);

    c.fillStyle = "rgba(0, 255, 136, 0.25)";
    c.fillRect(idealMinX, barY, idealMaxX - idealMinX, barHeight);

    c.strokeStyle = "#555";
    c.strokeRect(barX, barY, barWidth, barHeight);

    c.strokeStyle = "#888";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(idealMinX, barY - 4);
    c.lineTo(idealMinX, barY + barHeight + 4);
    c.moveTo(idealMaxX, barY - 4);
    c.lineTo(idealMaxX, barY + barHeight + 4);
    c.stroke();

    // current temperature line
    c.strokeStyle = tempColor;
    c.beginPath();
    c.moveTo(tempX, barY - 6);
    c.lineTo(tempX, barY + barHeight + 6);
    c.stroke();

    // current temp text beside line
    c.fillStyle = tempColor;
    c.font = "13px monospace";
    c.textAlign = tempX > barX + barWidth / 2 ? "right" : "left"; // prevent overflow
    c.fillText(`${temp.toFixed(1)}°C`, tempX + (tempX > barX + barWidth / 2 ? -6 : 6), barY - 8);

    // time label
    c.fillStyle = "#fff";
    c.font = "13px monospace";
    c.textAlign = "center";
    c.fillText(`Time: ${dayTime}`, barX + barWidth / 2, barY + 26);

    // ----- Warnings -----
    const warningX = 330;
    const warningY = 85;
    const lineHeight = 18;
    const warnings: string[] = [];

    // Conditions
    if (moisture < 0.3) warnings.push("⚠️ Add water");
    if (nutrients < 0.3) warnings.push("⚠️ Add fertilizer");
    if (sunlight < 0.5) warnings.push("⚠️ Increase sunlight");
    if (temp < tempBounds.min) warnings.push("❄️ Room too cold");
    else if (temp > tempBounds.max) warnings.push("🔥 Room too hot");

    // Warnings text
    if (warnings.length > 0) {
      c.fillStyle = "#ff4b4b";
      c.font = "13px sans-serif";
      c.textAlign = "left";
      warnings.forEach((msg, i) => {
        c.fillText(msg, warningX, warningY + i * lineHeight);
      });
    } else {
      // 'All conditions stable' when everything’s good
      c.fillStyle = "#00ff88";
      c.font = "13px sans-serif";
      c.textAlign = "left";
      c.fillText("All conditions stable", warningX, warningY);
}


    texture.needsUpdate = true;
  }

  // --- Moisture ---
  function drawDroplet(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    fillFraction: number,
    color: string
  ) {
    // Original path (y-range ≈ 2–40)
    const p = new Path2D(
      "M12 2 C18 10 22 18 22 26 C22 34 16 40 12 40 C8 40 2 34 2 26 C2 18 6 10 12 2 Z"
    );

    c.save();
    c.translate(x, y);

    const scale = size / 42;
    c.scale(scale, scale);

    c.translate(0, -2);

    c.save();
    c.clip(p);
    const fullHeight = 40;
    const fillHeight = fullHeight * Math.min(Math.max(fillFraction, 0), 1);
    const fillY = fullHeight - fillHeight;
    c.fillStyle = color;
    c.fillRect(0, fillY, 24, fillHeight);
    c.restore();

    // Outline
    c.lineWidth = 1.4;
    c.strokeStyle = "white";
    c.stroke(p);

    c.restore();
  }


  // --- Nutrients ---
  function drawPebble(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    fillFraction: number,
    color: string
  ) {
    c.save();
    c.translate(x, y);
    const radius = size / 2;

    c.beginPath();
    c.arc(radius, radius, radius, 0, Math.PI * 2);
    c.closePath();

    c.save();
    c.clip();
    const fillHeight = size * Math.min(Math.max(fillFraction, 0), 1);
    const fillY = size - fillHeight;
    c.fillStyle = color;
    c.fillRect(0, fillY, size, fillHeight);
    c.restore();

    c.lineWidth = 1.2;
    c.strokeStyle = "white";
    c.stroke();

    c.restore();
  }


  // --- Scene ---
  onMount(() => {
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
    directional.position.set(-150, 5, 5);
    scene.add(ambient, directional);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 512;
    screenCanvas.height = 256;
    ctx = screenCanvas.getContext("2d");
    texture = new THREE.CanvasTexture(screenCanvas);

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.FrontSide,
      opacity: 1.0,
      depthWrite: false,
    });

    const loader = new GLTFLoader();
    loader.load(
      "/pot_flat.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(4, 4, 4);
        model.position.set(0, -0.5, 0);
        scene.add(model);

        screenMesh = model.getObjectByName("FlatScreen") as THREE.Mesh;
        if (screenMesh) {
          screenMesh.material = screenMaterial;
          screenMesh.renderOrder = 2;
          screenMesh.position.z += 0.001;
        }
      },
      undefined,
      (err) => console.error("Error loading model:", err)
    );

    unsubscribe = plantState.subscribe((val) => {
      smoothMoisture.set(val.moisture);
      smoothSunlight.set(val.sunlight);
      smoothNutrients.set(val.nutrients);
      temp = val.temperature;
      dayTime = val.dayTime;
      tempBounds = val.tempBounds;
    });

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);

      let m: number, s: number, n: number;
      smoothMoisture.subscribe((v) => (m = v))();
      smoothSunlight.subscribe((v) => (s = v))();
      smoothNutrients.subscribe((v) => (n = v))();

      drawScreen(m!, s!, n!);

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener("resize", () => {
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
</style>
