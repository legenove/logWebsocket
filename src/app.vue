<template>
  <div id="main" class="app-main">
    <router-view/>
  </div>
</template>

<script>
  export default {}
</script>

<style>
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    background: #f0f0f0;
    overflow: auto;
  }

  .app-main {
    width: 100%;
    height: 100%;
  }
</style>
