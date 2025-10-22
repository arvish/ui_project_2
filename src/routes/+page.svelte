<script lang="ts">
  import { plantState } from '$lib/plantStore';
  import SimControls from '$lib/SimControls.svelte';
  import Pot from '$lib/Pot.svelte';
  $: state = $plantState;
  $: potColor = `hsl(${120 * state.moisture}, 40%, ${60 + state.sunlight * 20}%)`;
  $: plantScale = 0.5 + state.nutrients * 0.5;
</script>

<style>
  .container {
    display: flex;
    height: 100vh;
    z-index: 1;
    position: relative;
  }

  .top-header {
    position: absolute;
    top: 10px;
    right: 15px;
    z-index: 1000;
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.7);
    padding: 6px 10px;
    border-radius: 8px;
    backdrop-filter: blur(4px);
    text-align: right;
  }

  .left {
    flex: 1;
    padding: 1rem;
    background: rgba(238, 245, 238, 0.7); 
    backdrop-filter: blur(2px);            
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
    border-radius: 12px;
    pointer-events: none;
  }

  .pot {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: var(--pot-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.4s;
  }

  .plant {
    font-size: 60px;
    transition: transform 0.3s;
  }
</style>

<div class="container">
  <!-- header -->
  <div class="top-header">
    <div><b>Team:</b> Arvish Pandey, Long Nguyen, Mikhail Nikolaenko, Nikita Veytsman</div>
    <div><b>Project:</b> Smart Plant Pot</div>
  </div>

  <Pot />
  <div class="left">
    <h2>🌱 Smart Plant Pot</h2>
    
    <div class="pot" style="--pot-color: {potColor}">
      <div class="plant" style="transform: scale({plantScale})">🌿</div>
    </div>

    <p>Moisture: {(state.moisture * 100).toFixed(0)}%</p>
    <p>Sunlight: {(state.sunlight * 100).toFixed(0)}%</p>
    <p>Nutrients: {(state.nutrients * 100).toFixed(0)}%</p>
    <p>Temp: {state.temperature}°C</p>
    <p>Time: {state.dayTime}</p>
  </div>

  <SimControls />
</div>
