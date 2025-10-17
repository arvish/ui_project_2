<script lang="ts">
  import { plantState, resetPlant } from '$lib/plantStore';
  import TimeWheel from './TimeWheel.svelte';
  import { onMount, onDestroy } from 'svelte';

  $: state = $plantState;
  let time = 12; // in hours (0–24)
  let isRunning = false;
  let speed = 1; // multiplier
  let simInterval: ReturnType<typeof setInterval> | null = null;

  // --- Update day phase ---
  function updateLabel() {
    const val = time;
    const label =
      val < 6  ? 'Night' :
      val < 9  ? 'Dawn'  :
      val < 18 ? 'Day'   :
      val < 21 ? 'Dusk'  : 'Night';

    plantState.update(s => ({
      ...s,
      dayTime: label,
      // Simulate environment drift
      moisture: Math.max(s.moisture - 0.002 * speed, 0),
      nutrients: Math.max(s.nutrients - 0.001 * speed, 0),
      sunlight: (val >= 6 && val <= 18)
        ? Math.min(s.sunlight + 0.001 * speed, 1)
        : Math.max(s.sunlight - 0.0015 * speed, 0)
    }));
  }

  // --- Manual time change via wheel ---
  function handleTimeChange(e: CustomEvent) {
    time = e.detail.time;
    updateLabel();
  }

  // --- Simulation loop ---
  function startSim() {
    if (simInterval) return;
    simInterval = setInterval(() => {
      if (!isRunning) return;
      time = (time + (5 / 60) * speed) % 24; // 5 min per second × speed
      updateLabel();
    }, 1000);
  }

  function toggleSim() {
    isRunning = !isRunning;
    if (isRunning) startSim();
  }

  function incSpeed() {
    speed = Math.min(speed + 1, 10);
  }

  function decSpeed() {
    speed = Math.max(speed - 0.5, 0.5);
  }

  function resetSim() {
    time = 12;
    speed = 1;
    isRunning = false;
    resetPlant(); // resets store safely
  }

  onMount(() => startSim());
  onDestroy(() => {
    if (simInterval) clearInterval(simInterval);
  });
</script>

<style>
  .controls {
    background: #f7f7f7;
    border-left: 2px solid #ccc;
    height: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .sim-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  button {
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 0.4rem;
    background: #007aff;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
  }

  button:hover {
    background: #005fcc;
  }

  .label {
    font-size: 1.1rem;
    margin-top: 1rem;
  }

  .speed {
    font-size: 0.9rem;
    margin-top: 0.4rem;
    color: #555;
  }
</style>

<div class="controls">
  <h2>Simulation</h2>
  <TimeWheel {time} on:timechange={handleTimeChange} />

  <div class="sim-buttons">
    <button on:click={toggleSim}>{isRunning ? '⏸ Pause' : '▶️ Run'}</button>
    <button on:click={decSpeed}>– Speed</button>
    <button on:click={incSpeed}>+ Speed</button>
    <button on:click={resetSim}>🔄 Reset</button>
  </div>

  <div class="label">{time.toFixed(2)}h — {state.dayTime}</div>
  <div class="speed">Speed: {speed}×</div>
</div>
