<template>
    <div class="sign-up">
        <div class="hero is-info">
            <div class="hero-body has-text-centered">
                <h1 class="title">Sign Up</h1>
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
                            <label>First Name:</label>
                            <div class="control">
                                <input type="text" class="input" v-model="first_name" />
                            </div>
                        </div>

                        <div class="field">
                            <label>Last Name:</label>
                            <div class="control">
                                <input type="text" class="input" v-model="last_name" />
                            </div>
                        </div>

                        <div class="field">
                            <label>Password:</label>
                            <div class="control">
                                <input type="password" class="input" v-model="password" />
                            </div>
                        </div>

                        <div class="field">
                            <label>Repeat Password:</label>
                            <div class="control">
                                <input type="password" class="input" v-model="password2" />
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
                                <button class="button is-success">Sign Up</button>
                            </div>
                        </div>
                        <p>Or <router-link to="/login">Click here</router-link> to Login!</p>
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
            first_name: '',
            last_name: '',
            password: '',
            password2: '',
            errors: [],
        }
    },
    mounted() {
        document.title = 'Sign Up | LMS'
    },
    methods: {
        submitForm() {
            this.errors = []

            if (this.username === '') {
                this.errors.push('You must input an Email address')
            }

            if (this.first_name === '') {
                this.errors.push('You must input a First name')
            }

            if (this.last_name === '') {
                this.errors.push('You must input a Last name')
            }

            if (this.password === '') {
                this.errors.push('You must input a password')
            }

            if (this.password2 === '') {
                this.errors.push('You must repeat your password')
            }

            if (this.password != this.password2) {
                this.errors.push('Your passwords must match')
            }

            if (!this.errors.length) {
                const formData = {
                    username: this.username,
                    email: this.username,
                    first_name: this.first_name,
                    last_name: this.last_name,
                    password: this.password,
                }

                axios
                    .post('/api/v1/users/', formData)
                    .then(response => {
                        this.$router.push('/login')
                    })
                    .catch(error => {
                        if (error.message) {
                            for (const property in error.response.data) {
                                this.errors.push(`${error.response.data[property]}`)
                            }
                        } else if (error.message) {
                            this.errors.push('Something went wrong, please try again')

                            console.log(JSON.stringify(error))
                        }
                    })
            }
        }
    },
}
</script>