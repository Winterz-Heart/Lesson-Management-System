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
			<template v-if="fetchCurrentUserRole === 'student'">
				<div id="navbar-item" class="navbar-menu">
					<div class="navbar-start" >
						<router-link to="/dashboard/my-account" class="navbar-item">My Account</router-link>
						<router-link to="/dashboard/my-account/started" class="navbar-item">My Started Courses</router-link>
						<router-link to="/dashboard/my-account/completed" class="navbar-item">My Finished Courses</router-link>
					</div>
				</div>
			</template>

			<template v-if="fetchCurrentUserRole === 'teacher' || fetchCurrentUserRole === 'admin' ">
				<div id="navbar-item" class="navbar-menu">
					<div class="navbar-start" >
						<router-link to="/dashboard/my-account" class="navbar-item">My Account</router-link>
						<router-link to="#" class="navbar-item">Course Creator</router-link>
						<router-link to="#" class="navbar-item">Course Editor</router-link>
						<router-link to="#" class="navbar-item">Draft Courses</router-link>
						<router-link to="#" class="navbar-item">Published Courses</router-link>
					</div>
				</div>
			</template>
		</nav>

        <section class="section">
			<router-view />
        </section>

		<section class="section">

		</section>
    </div>
</template>

<script>
export default {
  mounted() {
    document.title = "My Account | LMS";
  },
  computed: {
	fetchCurrentUserRole() {
		return this.$store.state.user.role
	}
  },
};
</script>