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
                    <form v-on:submit.prevent="submitForm()" >
                        <div class="field">
                            <label>Email:</label>
                            <div class="control">
                                <input type="email" class="input" v-model="username" />
                            </div>
                        </div>

                        <div class="field">
                            <label>Password:</label>
                            <div class="control">
                                <input type="password" class="input" v-model="password" />
                            </div>
                        </div>

                        <div class="notification is-danger" v-if="errors.length">
                            <p
                                v-for="error in errors"
                                v-bind:key="error"
                            >
                                {{ error }}
                            </p>
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
import axios from 'axios'

export default {
    data() {
        return {
            username: '',
            password: '',
            errors: [],
        }
    },
    methods: {
        submitForm() {
            axios.defaults.headers.common['Authorization'] = ''
            localStorage.removeItem('token')
            this.errors = []

            if (this.username === '') {
                this.errors.push('You must input an Email address')
            }

            if (this.password === '') {
                this.errors.push('You must input a password')
            }

            if (!this.errors.length) {
                const formData = {
                    username: this.username,
                    password: this.password,
                }

                axios
                    .post('api/v1/token/login/', formData)
                    .then(async response => {
                        const token = response.data.auth_token

                        this.$store.commit('setToken', token)

                        axios.defaults.headers.common['Authorization'] = 'Token ' + token

                        localStorage.setItem('token', token)

                        await this.$store.dispatch('fetchCurrentUser')

                        this.$router.push('/dashboard/my-account')
                    })
                    .catch(error => {
                        if (error.response) {
                            for (const property in error.response.data) {
                                this.errors.push(`${error.response.data[property]}`)
                            }
                        } else if (error.message) {
                            this.errors.push('Something went wrong. Please try again')

                            console.log(JSON.stringify(error))
                        }
                    })
            }
        }
    },
    mounted() {
        document.title = 'Login | LMS'
    }
}
</script>