<template>
    <div class="login">
        <div class="hero is-info">
            <div class="hero-body has-text-centered">
                <h1 class="title">Login</h1>
            </div>
        </div>

        <div class="container">
            <div class="columns">
                <div class="column is-4 is-offset-4 mt-6 mb-6">
                    <form>
                        <div class="field">
                            <label>Email:</label>
                            <div class="control">
                                <input type="email" class="input" />
                            </div>
                        </div>

                        <div class="field">
                            <label>Password:</label>
                            <div class="control">
                                <input type="password" class="input" />
                            </div>
                        </div>

                        <div class="field">
                            <div class="contorl">
                                <button class="button is-dark">Login</button>
                            </div>
                        </div>
                        
                        <p>Or <router-link to="/sign-up">Click here</router-link> to Sign up!</p>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    mounted() {
        document.title = 'Login | LMS'
    }
}
</script>