<template>
  <div class="home">
    <div class="hero is-info">
      <div class="her-body has-text-centered">
        <h1 class="title">Welcome to LMS</h1>
        <br/>
        <h2 class="subtitle">An online place for learning course and lessons</h2>
        <br/>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="column is-12 has-text-centered">
          <router-link to="/sign-up" class="button is-info is-size-3 mt-6 mb-6"
            >Click to get started!</router-link
          >
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  mounted() {
    document.title = 'Home | LMS'
  }
}
</script>
