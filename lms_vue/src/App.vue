<template>
  <Navbar />

  <router-view/>

  <Footer />
</template>

<script>

import axios from 'axios';
import Footer from './components/Footer.vue';
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
  },
  beforeCreate() {
    this.$store.commit('initializeStore')

    const token = this.$store.state.user.token

    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Token ' + token
      this.$store.dispatch('fetchCurrentUser')
    } else {
      axios.defaults.headers.common['Authorization'] = ''
    }
  }
};

</script>


<style lang="scss">
@import '../node_modules/bulma';
</style>
