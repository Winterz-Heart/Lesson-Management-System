<template>
  <div class="about">
    <div class="hero is-info">
      <div class="hero-body has-text-centered">
        <h1 class="title">About</h1>
      </div>
    </div>
    
    <section class="section">
      <div  class="has-text-centered mt-10 mb-10">
        <h1>This my attempt at making a Lesson Management System, using a Django based backend to store all of its data</h1>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  mounted() {
    document.title = 'About | LMS'
  }
}
</script>
