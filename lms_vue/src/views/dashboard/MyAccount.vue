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
						<router-link to="/dashboard/my-account/student-tracker" class="navbar-item">Student Tracker</router-link>
						<router-link to="/dashboard/my-account/course-create" class="navbar-item">Course Creator</router-link>
						<router-link to="/dashboard/my-account/drafts" class="navbar-item">Draft Courses</router-link>
						<router-link to="/dashboard/my-account/published" class="navbar-item">Published Courses</router-link>
					</div>
				</div>
			</template>

			<template v-if="fetchCurrentUserRole === 'admin' ">
				<div id="navbar-item" class="navbar-menu">
					<div class="navbar-end" >
						<div class="navbar-item has-dropdown is-hoverable">
							<a class="navbar-link">Admin</a>
							<div class="navbar-dropdown is-right">
								<router-link to="/dashboard/admin/drafts" class="navbar-item">All Draft Courses</router-link>
								<router-link to="/dashboard/admin/published" class="navbar-item">All Published Courses</router-link>
								<router-link to="/dashboard/admin/student-tracker" class="navbar-item">Adjust Student Progress</router-link>
								<router-link to="/dashboard/admin/role-adjustor" class="navbar-item">Role Adjustment</router-link>
							</div>
						</div>
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