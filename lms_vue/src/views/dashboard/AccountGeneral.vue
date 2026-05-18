<template>
    <div>
        <h2 class="title is-4">My Account</h2>

        <template v-if="user">
            <p><strong>Username:</strong> {{ user.username }}</p>
            <p><strong>First name:</strong> {{ user.first_name }}</p>
            <p><strong>Last name:</strong> {{ user.last_name }}</p>
        </template>

        <template v-else>
            <p>Loading account details...</p>
        </template>

        <br />
        <br />
        <button @click="logout()" class="button is-danger">Log Out</button>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            user: null,
        }
    },
    async mounted() {
        await axios
            .get('api/v1/users/me')
            .then(response => {
                this.user = response.data
            })
            .catch((error) => {
                console.log(error)
            })
    },
    methods: {
        async logout() {
            await axios
                .post('/token/logout')
                .then(() => {
                    axios.defaults.headers.common['Authorization'] = ''
                    localStorage.removeItem('token')
                    this.$store.commit('removeToken')
                    this.$router.push('/')
                })
                .catch((error) => {
                    console.log(error)
                })
        },
    },
}
</script>