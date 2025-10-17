<script lang="ts">
  import { plantState } from '$lib/plantStore'
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

  let pouring = false
  let rotation = tweened(0, { duration: 400, easing: cubicOut })
  let pourTimer: ReturnType<typeof setInterval> | null = null

  let streamX = -10
  let streamY = 75

  function startPour() {
    pouring = true
    rotation.set(-30)
    pourTimer = setInterval(() => {
      plantState.update(s => ({
        ...s,
        nutrients: Math.min(s.nutrients + 0.01, 1)
      }))
    }, 150)
  }

  function stopPour() {
    pouring = false
    rotation.set(0)
    if (pourTimer) clearInterval(pourTimer)
  }
</script>

<style>
  .bag-container {
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

  .bag-top {
    width: 80px;
    height: 20px;
    background: #d1973c;
    border-radius: 6px 6px 0 0;
    border: 2px solid #8a5e15;
  }

  .bag-body {
    width: 80px;
    height: 60px;
    background: #c6882e;
    border-radius: 0 0 10px 10px;
    border: 2px solid #8a5e15;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff4c4;
    font-weight: 600;
    font-size: .9rem;
    font-family: system-ui, sans-serif;
  }

  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle at top, #ffd95e, #c6850f);
    animation: fall .5s linear infinite;
    opacity: .9;
  }

  @keyframes fall {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(25px); opacity: 0; }
  }
</style>

<div class="bag-container"
  role="button"
  aria-label="Pour fertilizer"
  tabindex="0"
  on:mousedown={startPour}
  on:mouseup={stopPour}
  on:mouseleave={stopPour}
  on:touchstart={startPour}
  on:touchend={stopPour}
>
  <div class="rot-group" style="transform: rotate({$rotation}deg);">
    <div class="bag-top"></div>
    <div class="bag-body">NPK</div>
  </div>

  {#if pouring}
    <div class="particle" style="left:{streamX}px; top:{streamY}px;"></div>
    <div class="particle" style="left:{streamX + 10}px; top:{streamY + 5}px; animation-delay:.15s;"></div>
    <div class="particle" style="left:{streamX + 20}px; top:{streamY}px; animation-delay:.3s;"></div>
  {/if}
</div>
