<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { plantState, resetPlant, setMoisture, setNutrients, setSunlight, setTemperature, setTempBounds, updatePlant, setDayTime } from '$lib/plantStore';
  import TimeWheel from './TimeWheel.svelte';
  import WaterBucket from './WaterBucket.svelte';
  import FertilizerBag from './FertilizerBag.svelte';

  $: state = $plantState;

  let time = 12;
  let running = false;
  let speed = 1;
  let interval: ReturnType<typeof setInterval> | null = null;

  function updateLabel() {
    let label = 'Day';
    if (time < 6) label = 'Night';
    else if (time < 9) label = 'Dawn';
    else if (time < 18) label = 'Day';
    else if (time < 21) label = 'Dusk';
    else label = 'Night';

    setDayTime(label);

    // Simulate environmental decay/increase
    setMoisture(-0.002 * speed);
    setNutrients(-0.0015 * speed);
    if (time >= 6 && time <= 18)
      setSunlight(+0.001 * speed);
    else
      setSunlight(-0.0015 * speed);
  }

  function handleTimeChange(e: CustomEvent) {
    time = e.detail.time;
    updateLabel();
  }

  function startSim() {
    if (interval) return;
    interval = setInterval(() => {
      if (!running) return;
      time = (time + (5 / 60) * speed) % 24; // 5 mins = 1 sec
      updateLabel();
    }, 1000);
  }

  function toggleSim() {
    running = !running;
    if (running) startSim();
  }

  function incSpeed() { if (speed < 10) speed += 1; }
  function decSpeed() { if (speed > 0.5) speed -= 0.5; }

  function resetSim() {
    time = 12;
    speed = 1;
    running = false;
    resetPlant();
  }

  // Temperature control
  function incTemp() {
    setTemperature(Math.min(state.temperature + 1, 40));
  }

  function decTemp() {
    setTemperature(Math.max(state.temperature - 1, 0));
  }

  function updateBounds() {
    setTempBounds(state.tempBounds.min, state.tempBounds.max);
  }

  onMount(() => startSim());
  onDestroy(() => { if (interval) clearInterval(interval); });
</script>

<style>
  .controls {
    position: relative;
    z-index: 2;
    background: #f7f7f7;
    border-left: 2px solid #ccc;
    height: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .buttons {
    display: flex;
    gap: .5rem;
    margin-top: 1rem;
  }

  button {
    padding: .4rem .8rem;
    border: none;
    border-radius: .4rem;
    background: #007aff;
    color: white;
    font-size: .9rem;
    cursor: pointer;
  }

  button:hover { background: #005fcc; }

  .label { margin-top: 1rem; }
  .speed { font-size: .9rem; color: #555; margin-top: .4rem; }

  .temp-control, .bounds-control {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  .temp-buttons, .bounds-inputs {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .temp-buttons button, .bounds-inputs input {
    background: #007aff;
    color: white;
    border: none;
    border-radius: 0.4rem;
    padding: 0.3rem 0.6rem;
    font-size: 1rem;
    cursor: pointer;
  }

  .bounds-inputs input {
    background: white;
    color: #222;
    border: 1px solid #aaa;
    width: 45px;
    text-align: center;
    font-size: .9rem;
  }

  .temp-buttons button:hover { background: #005fcc; }
</style>

<div class="controls">
  <h2>Simulation</h2>
  <TimeWheel {time} on:timechange={handleTimeChange} />

  <div class="buttons">
    <button on:click={toggleSim}>{running ? '⏸ Pause' : '▶Run'}</button>
    <button on:click={decSpeed}>– Speed</button>
    <button on:click={incSpeed}>+ Speed</button>
    <button on:click={resetSim}>Reset</button>
  </div>

  <div class="label">{time.toFixed(2)}h — {state.dayTime}</div>
  <div class="speed">Speed: {speed}×</div>

  <div class="temp-control">
    <div>Room Temp</div>
    <div class="temp-buttons">
      <button on:click={decTemp}>–</button>
      <span class="temp-value">{state.temperature.toFixed(0)}°C</span>
      <button on:click={incTemp}>+</button>
    </div>
  </div>

  <div class="bounds-control">
    <div>Ideal Temp Range</div>
    <div class="bounds-inputs">
      <input type="number" bind:value={state.tempBounds.min} min="0" max="50" on:change={updateBounds} />
      <span>–</span>
      <input type="number" bind:value={state.tempBounds.max} min="0" max="50" on:change={updateBounds} />
    </div>
  </div>

  <WaterBucket />
  <FertilizerBag />
</div>
