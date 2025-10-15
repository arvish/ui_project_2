<script lang="ts">
  import { plantState } from '$lib/plantStore';
  $: state = $plantState;

  let time = 12;
  $: angle = (time / 24) * 360;
  $: isNight = time >= 12;

  function updateTime(e: Event) {
    const target = e.target as HTMLInputElement;
    const val = +target.value;
    time = val;
    plantState.update(s => ({
      ...s,
      dayTime:
        val < 6 ? 'Night' :
        val < 12 ? 'Morning' :
        val < 18 ? 'Afternoon' :
        'Evening'
    }));
  }
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

  .time-wheel {
    position: relative;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(to bottom, #87ceeb 50%, #0b0b25 50%);
    margin-top: 1rem;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  }

  .cloud, .star {
    position: absolute;
    font-size: 18px;
    opacity: 0.8;
  }

  .cloud {
    animation: floatCloud 15s linear infinite;
  }
  @keyframes floatCloud {
    from { transform: translateX(-60px); }
    to { transform: translateX(260px); }
  }

  .star {
    animation: twinkle 2s ease-in-out infinite alternate;
  }
  @keyframes twinkle {
    from { opacity: 0.3; }
    to { opacity: 1; }
  }

  .orbit {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(var(--angle));
    transform-origin: center center;
    transition: transform 0.3s ease;
  }

  .dot {
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    transform: translateY(-95px); /* radius of orbit */
  }

  .icon {
    font-size: 28px;
    transform: translateY(-70px); /* inside orbit */
  }

  .slider {
    width: 100%;
    margin-top: 2rem;
  }

  .label {
    font-size: 1.1rem;
    margin-top: 1rem;
  }
</style>

<div class="controls">
  <h2>Simulation</h2>

  <div class="time-wheel">
    {#if !isNight}
      <div class="cloud" style="top:40px; left:20px;">☁️</div>
      <div class="cloud" style="top:70px; left:100px; animation-delay:5s;">☁️</div>
      <div class="cloud" style="top:90px; left:-30px; animation-delay:10s;">☁️</div>
    {:else}
      <div class="star" style="top:30px; left:40px;">✨</div>
      <div class="star" style="top:60px; left:120px; animation-delay:1s;">✨</div>
      <div class="star" style="top:90px; left:80px; animation-delay:2s;">✨</div>
      <div class="star" style="top:50px; left:150px; animation-delay:0.5s;">✨</div>
    {/if}

    <div class="orbit" style="--angle:{angle}deg">
      <div class="dot"></div>
      <div class="icon">{!isNight ? '☀️' : '🌙'}</div>
    </div>
  </div>

  <input
    class="slider"
    type="range"
    min="0"
    max="24"
    step="0.1"
    bind:value={time}
    on:input={updateTime}
  />

  <div class="label">{time.toFixed(1)}h — {state.dayTime}</div>
</div>
