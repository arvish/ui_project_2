<script lang="ts">
  import { plantState, resetPlant } from '$lib/plantStore'
  import TimeWheel from './TimeWheel.svelte'
  import WaterBucket from './WaterBucket.svelte'
  import FertilizerBag from './FertilizerBag.svelte'
  import { onMount, onDestroy } from 'svelte'

  $: state = $plantState

  let time = 12 // 0–24 hrs
  let running = false
  let speed = 1
  let interval: ReturnType<typeof setInterval> | null = null

  function updateLabel() {
    let label = 'Day'
    if (time < 6) label = 'Night'
    else if (time < 9) label = 'Dawn'
    else if (time < 18) label = 'Day'
    else if (time < 21) label = 'Dusk'
    else label = 'Night'

    plantState.update(s => ({
      ...s,
      dayTime: label,
      moisture: Math.max(s.moisture - 0.002 * speed, 0),
      nutrients: Math.max(s.nutrients - 0.001 * speed, 0),
      sunlight: time >= 6 && time <= 18
        ? Math.min(s.sunlight + 0.001 * speed, 1)
        : Math.max(s.sunlight - 0.0015 * speed, 0)
    }))
  }

  function handleTimeChange(e: CustomEvent) {
    time = e.detail.time
    updateLabel()
  }

  function startSim() {
    if (interval) return
    interval = setInterval(() => {
      if (!running) return
      time = (time + (5 / 60) * speed) % 24 // 5 mins = 1 sec
      updateLabel()
    }, 1000)
  }

  function toggleSim() {
    running = !running
    if (running) startSim()
  }

  function incSpeed() {
    if (speed < 10) speed += 1
  }

  function decSpeed() {
    if (speed > 0.5) speed -= 0.5
  }

  function resetSim() {
    time = 12
    speed = 1
    running = false
    resetPlant()
  }

  onMount(() => startSim())
  onDestroy(() => {
    if (interval) clearInterval(interval)
  })
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

  button:hover {
    background: #005fcc;
  }

  .label {
    margin-top: 1rem;
  }

  .speed {
    font-size: .9rem;
    color: #555;
    margin-top: .4rem;
  }
</style>

<div class="controls">
  <h2>Simulation</h2>

  <TimeWheel {time} on:timechange={handleTimeChange} />

  <div class="buttons">
    <button on:click={toggleSim}>{running ? '⏸ Pause' : '▶️ Run'}</button>
    <button on:click={decSpeed}>– Speed</button>
    <button on:click={incSpeed}>+ Speed</button>
    <button on:click={resetSim}>🔄 Reset</button>
  </div>

  <div class="label">{time.toFixed(2)}h — {state.dayTime}</div>
  <div class="speed">Speed: {speed}×</div>

  <WaterBucket />
  <FertilizerBag />
</div>
