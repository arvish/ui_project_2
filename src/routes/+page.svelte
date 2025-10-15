<script lang="ts">
  import { plantState } from '$lib/plantStore';
  $: state = $plantState;

  // derived styles
  $: potColor = `hsl(${120 * state.moisture}, 40%, ${60 + state.sunlight * 20}%)`;
  $: plantScale = 0.5 + state.nutrients * 0.5;
</script>

<style>
  .container {
    display: flex;
    height: 100vh;
  }
  .left, .right {
    flex: 1;
    padding: 1rem;
  }
  .left {
    background: #eef5ee;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
  }
  .pot {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: var(--pot-color);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.4s;
  }
  .plant {
    font-size: 60px;
    transition: transform 0.3s;
  }
  .right {
    background: #f7f7f7;
    border-left: 2px solid #ccc;
  }
  .stat {
    margin: 0.5rem 0;
  }
  label {
    display: block;
    margin: 1rem 0;
  }
</style>

<div class="container">
  <div class="left">
    <h2>🌱 Smart Plant Pot</h2>
    <div class="pot" style="--pot-color: {potColor}">
      <div class="plant" style="transform: scale({plantScale})">
        🌿
      </div>
    </div>

    <p>Moisture: {(state.moisture * 100).toFixed(0)}%</p>
    <p>Sunlight: {(state.sunlight * 100).toFixed(0)}%</p>
    <p>Nutrients: {(state.nutrients * 100).toFixed(0)}%</p>
    <p>Temp: {state.temperature}°C</p>
    <p>Time: {state.dayTime}</p>
  </div>

  <div class="right">
    <h2>Simulation</h2>

    <label>
      Rain:
      <input type="range" min="0" max="1" step="0.01"
        bind:value={state.rainAmount}
        on:input={() => plantState.update(s => ({ ...s, rainAmount: +state.rainAmount }))}/>
      {Math.round(state.rainAmount * 100)}%
    </label>

    <label>
      Speed:
      <input type="number"
        bind:value={state.simulationSpeed}
        on:input={() => plantState.update(s => ({ ...s, simulationSpeed: +state.simulationSpeed }))}/>
    </label>

    <label>
      Day Time:
      <select bind:value={state.dayTime}
        on:change={() => plantState.update(s => ({ ...s, dayTime: state.dayTime }))}>
        <option>Morning</option>
        <option>Afternoon</option>
        <option>Night</option>
      </select>
    </label>
  </div>
</div>
