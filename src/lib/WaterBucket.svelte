<script lang="ts">
  import { plantState } from '$lib/plantStore'
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

  let isPouring = false
  let rotation = tweened(0, { duration: 400, easing: cubicOut })
  let pourTimer: ReturnType<typeof setInterval> | null = null

  let streamX = 20
  let streamY = 75

  function startPour() {
    isPouring = true
    rotation.set(-40)
    pourTimer = setInterval(() => {
      plantState.update(s => ({
        ...s,
        moisture: Math.min(s.moisture + 0.01, 1)
      }))
    }, 150)
  }

  function stopPour() {
    isPouring = false
    rotation.set(0)
    if (pourTimer) clearInterval(pourTimer)
  }
</script>

<style>
  .bucket-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1rem;
    height: 160px;
    cursor: pointer;
  }

  .rot-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    transform-origin: top right;
  }

  .handle {
    width: 80px;
    height: 25px;
    border: 3px solid #777;
    border-bottom: none;
    border-radius: 50px 50px 0 0;
    margin-bottom: -5px;
  }

  .bucket {
    width: 80px;
    height: 60px;
    background: #a3a3a3;
    border-radius: 0 0 20px 20px;
    border: 2px solid #777;
  }

  .stream {
    position: absolute;
    width: 8px;
    height: 40px;
    border-radius: 4px;
    background: linear-gradient(to bottom, #00aaff, #0077ff);
    animation: pour .4s linear infinite;
    opacity: .8;
  }

  @keyframes pour {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(20px); opacity: 0; }
  }
</style>

<div class="bucket-container"
  role="button"
  aria-label="Pour water"
  tabindex="0"
  on:mousedown={startPour}
  on:mouseup={stopPour}
  on:mouseleave={stopPour}
  on:touchstart={startPour}
  on:touchend={stopPour}
>
  <div class="rot-group" style="transform: rotate({$rotation}deg);">
    <div class="handle"></div>
    <div class="bucket"></div>
  </div>

  {#if isPouring}
    <div class="stream" style="left:{streamX}px; top:{streamY}px;"></div>
    <div class="stream" style="left:{streamX + 10}px; top:{streamY}px; animation-delay:.2s;"></div>
  {/if}
</div>
