<template>
  <div class="home">
    <div class="hero is-info">
      <div class="hero-body has-text-centered">
        <h1 class="title">Welcome to LMS</h1>
        <br/>
        <h2 class="subtitle">An online place for learning course and lessons</h2>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <h3 class="subtitle has-text-centered mb-8">Here are some of our Courses!</h3>
        <div class="columns is-multiline">
          <div
            v-for="course in courses"
            :key="course.id"
            class="column is-3"
          >
            <CourseCard :course="course" />
          </div>
        </div>

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
import CourseCard from '../components/CourseCard.vue';

export default {
  data() {
    return {
      courses: [
        { id: 1, title: 'Vue Basics', short_description: 'Intro to Vue' },
        { id: 2, title: 'Django Basics', short_description: 'Intro to Django' },
        { id: 3, title: 'UI Design', short_description: 'Design fundamentals' },
        { id: 4, title: 'Python', short_description: 'Python fundamentals' },
    ],
    }
  },
  mounted() {
    document.title = 'Home | LMS'
  },
  components: {
    CourseCard
  }
}
</script>
