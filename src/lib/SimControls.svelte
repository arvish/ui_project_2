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

  // Info overlay state
  let showInfo = false;

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
    if (time >= 6 && time <= 18) setSunlight(+0.001 * speed);
    else setSunlight(-0.0015 * speed);
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
  function incTemp() { setTemperature(Math.min(state.temperature + 1, 40)); }
  function decTemp() { setTemperature(Math.max(state.temperature - 1, 0)); }
  function updateBounds() { setTempBounds(state.tempBounds.min, state.tempBounds.max); }

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
    padding: 1rem 1rem 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .toprow {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;      
    position: relative;           
  }

  .info-btn {
    position: absolute;
    left: 0;                     
    top: 0;
    background: #2e2e2e;
    color: #fff;
    border: none;
    padding: .35rem .6rem;
    border-radius: .4rem;
    font-size: .85rem;
    cursor: pointer;
    line-height: 1;
    transition: background .2s;
  }
  .info-btn:hover { background: #444; }

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

  /* Overlay */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
  }
  .info-box {
    background: #fff;
    color: #222;
    padding: 1.25rem 1.5rem;
    border-radius: 10px;
    width: 360px;
    font-size: .95rem;
    line-height: 1.4;
    box-shadow: 0 4px 10px rgba(0,0,0,.2);
  }
  .close-btn {
    display: inline-block;
    margin-top: 1rem;
    background: #ddd;
    color: #111;
    border: none;
    padding: .5rem .9rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: .85rem;
    transition: background .2s;
  }
  .close-btn:hover { background: #ccc; }
</style>

<div class="controls">
  <div class="toprow">
    <button class="info-btn" on:click={() => showInfo = true}>Info</button>
    <h2>Simulation</h2>
  </div>

  <TimeWheel {time} on:timechange={handleTimeChange} />

  <div class="buttons">
    <button on:click={toggleSim}>{running ? '⏸ Pause' : '▶ Run'}</button>
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

{#if showInfo}
  <div class="overlay" on:click={() => showInfo = false} on:keydown={(e) => e.key === 'Escape' && (showInfo = false)} role="button" tabindex="0">
    <div class="info-box" on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="-1">
      <h3>Controls Quick Guide</h3>
      <p>
        Turn the time wheel to set the hour. Hit Run/Pause to start the sim, and tweak the speed buttons.
        Pour water for moisture, add fertilizer for nutrients. Set the room temp and the plant's ideal range.
        Keep everything balanced: moisture, light, nutrients, and temp.
      </p>
      <button class="close-btn" on:click={() => showInfo = false}>Close</button>
    </div>
  </div>
{/if}
