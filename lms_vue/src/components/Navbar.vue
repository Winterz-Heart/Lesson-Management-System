<template>
    <nav
        class="navbar is-info"
        role="navigation"
        aria-label="main navigation"
        style="min-height: 5rem;"
    >
        <div class="navbar-brand">
            <router-link to="/" class="navbar-item is-size-4">LMS</router-link>
        </div>

        <div id="navbar-item" class="navbar-menu">
            <div class="navbar-start">
                <router-link to="/about" class="navbar-item">About</router-link>
            </div>
        </div>

        <div class="navbar-end">
            <template v-if="isAuthenticated" >
                <div class="navbar-item">
                    <a href="/dashboard/my-account" class="button is-primary is-size-4">
                        <img class="fas fa-id-card" />
                    </a>
                </div>
            </template>

            <template v-else>
                <div class="navbar-item">
                    <div class="buttons">
                        <router-link to="/sign-up" class="button is-primary"
                            ><strong>Sign up</strong></router-link
                        >
                        <router-link to="/login" class="button is-light">Login</router-link>
                    </div>
                </div>
            </template>
        </div>
    </nav>
</template>

<script>
export default {
    computed: {
        isAuthenticated() {
            return this.$store.state.user.isAuthenticated
        }
    }
}
</script>