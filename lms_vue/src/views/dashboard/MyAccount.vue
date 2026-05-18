<template>
    <div class="myAccount">
        <div class="hero is-info">
            <div class="hero-body has-text-centered">
                <h1 class="title">My Account</h1>
            </div>
        </div>
		
		<nav
			class="navbar"
			role="navigation account"
			aria-label="navigation"
		>
			<div id="navbar-item" class="navbar-menu">
				<div class="navbar-start" >
					<router-link to="/dashboard/my-account" class="navbar-item">My Account</router-link>
					<router-link to="/dashboard/my-account/started" class="navbar-item">My Started Courses</router-link>
					<router-link to="/dashboard/my-account/completed" class="navbar-item">My Finished Courses</router-link>
				</div>
			</div>
		</nav>

        <section class="section">
			<router-view />
        </section>

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