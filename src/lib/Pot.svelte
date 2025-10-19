<script lang="ts">
  const potImage = '/plant_pot.jpg';
</script>

<div class="background">
  <img src={potImage} alt="Smart Plant Pot Background" class="background-image" />
</div>

<style>
  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: -1;
    pointer-events: none;
    overflow: hidden;
  }

  .background-image {
    height: 75vh;
    width: auto;
    object-fit: contain;
    transform: translateX(-40%) translateY(-10%);
    opacity: 0.65;
    filter: brightness(1.15) contrast(1.05);
    transition: transform 0.4s ease, opacity 0.4s ease;
  }
</style>
