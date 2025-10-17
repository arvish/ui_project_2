<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let time: number; // 0–24
  const dispatch = createEventDispatcher();

  // ----- phase / color -----
  $: isNight = time >= 21 || time < 6;
  $: isDawn  = time >= 6 && time < 9;
  $: isDusk  = time >= 18 && time < 21;
  $: showSun = time >= 6 && time < 18;

  $: bgGradient = isNight
    ? 'linear-gradient(to bottom, #0b0b25, #01010a)'
    : isDawn
      ? 'linear-gradient(to bottom, #ffb07a, #2a2a66)'
      : isDusk
        ? 'linear-gradient(to bottom, #ff9e6e, #1d1d4a)'
        : 'linear-gradient(to bottom, #87ceeb, #fefbd8)';

  // ----- continuous rotation -----
  let wheel: HTMLDivElement;
  let isDragging = false;
  let startAngle = 0;
  let startTime = 0;
  let totalRotation = (time / 24) * 360 + 180; // continuous degrees
  let lastLogicalAngle = (time / 24) * 360;

  $: {
    // Update rotation continuously when time changes
    const logicalAngle = (time / 24) * 360;
    let diff = logicalAngle - lastLogicalAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    totalRotation += diff;
    lastLogicalAngle = logicalAngle;
  }

  // ----- drag behavior -----
  function handleDown(e: MouseEvent | TouchEvent) {
    startAngle = getPointerAngle(e);
    startTime = time;
    isDragging = true;
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return;
    const angle = getPointerAngle(e);
    let delta = angle - startAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const newTime = (startTime + (delta / 360) * 24 + 24) % 24;
    dispatch('timechange', { time: newTime });
  }

  function handleUp() {
    isDragging = false;
  }

  function getPointerAngle(e: MouseEvent | TouchEvent): number {
    const rect = wheel.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const client = 'touches' in e ? e.touches[0] : e;
    const dx = client.clientX - cx;
    const dy = client.clientY - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 180;
    return angle;
  }

  // ----- helper -----
  function formatTime(t: number): string {
    const h = Math.floor(t);
    const m = Math.round((t % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
</script>

<style>
  .time-wheel {
    position: relative;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    overflow: hidden;
    margin-top: 1rem;
    box-shadow: 0 0 8px rgba(0,0,0,0.3);
    transition: background 0.6s ease;
    touch-action: none;
    user-select: none;
  }

  .orbit {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center center;
  }

  .dot {
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    transform: translateY(-95px);
  }

  .icon {
    font-size: 28px;
    transform: translateY(-70px);
  }

  .center-time {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: system-ui, sans-serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: white;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.6);
    pointer-events: none;
    user-select: none;
  }
</style>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={wheel}
    role="slider"
    aria-label="time wheel control"
    aria-valuemin="0"
    aria-valuemax="24"
    aria-valuenow={time}
    tabindex="0"
    class="time-wheel"
    style="background:{bgGradient}"
    on:mousedown={handleDown}
    on:mousemove={handleMove}
    on:mouseup={handleUp}
    on:mouseleave={handleUp}
    on:touchstart={handleDown}
    on:touchmove={handleMove}
    on:touchend={handleUp}
>
  <div
    class="orbit"
    style="transform:translate(-50%, -50%) rotate({totalRotation}deg)"
  >
    <div class="dot"></div>
    <div class="icon">{showSun ? '☀️' : '🌙'}</div>
  </div>

  <!-- Centered Time Display -->
  <div class="center-time">{formatTime(time)}</div>
</div>
