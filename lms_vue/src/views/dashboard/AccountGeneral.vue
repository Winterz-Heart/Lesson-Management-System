<template>
    <div>
        <h2 class="title is-4">My Account</h2>
        <p>Profile details, email, joined date, etc.</p>
        <br/>
        <button @click="logout()" class="button is-danger">Log Out</button>
    </div>
</template>

<script>
import axios from 'axios';

export default {
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
}
</script>