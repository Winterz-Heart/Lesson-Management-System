<template>
    <div class="myAccount">
        <div class="hero is-info">
            <div class="hero-body has-text-centered">
                <h1 class="title">My Account</h1>
            </div>
        </div>

        <section class="section">
            <button @click="logout()" class="button is-danger">Log Out</button>
        </section>
    </div>
</template>

<script>
import axios from "axios";

export default {
  mounted() {
    document.title = "My Account | LMS";
  },
  methods: {
    async logout() {
      try {
        await axios.post("/token/logout/");
      } catch (error) {
        console.log(error);
      } finally {
        axios.defaults.headers.common["Authorization"] = "";

        localStorage.removeItem("token");

        this.$store.commit("removeToken");

        this.$router.push("/");
      }
    },
  },
};
</script>