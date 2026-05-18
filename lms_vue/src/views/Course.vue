<template>
    <div class="about">
        <div class="hero is-info">
            <div class="hero-body has-text-centered">
                <h1 class="title">{{ course.title }}</h1>
                <br />
                <router-link to="#" class="subtitle">By {{ course.created_by.first_name + " " + course.created_by.last_name }}</router-link>
            </div>
        </div>
        
        <section class="section">
            <div class="container">
                <div class="columns">
                    <div class="column is-2" >
                        <aside class="menu">
                            <p class="menu-label">Table of Contents</p>
                            <ul class="menu-list">
                                <li><a>Introduction</a></li>
                                <li><a>Lessons will go here</a></li>
                            </ul>
                        </aside>
                    </div>

                    <div class="column is-10">
                        <template v-if="isAuthenticated">
                            <h2 class="subtitle">Introduction</h2>
                            <br />
                            <p>{{ course.long_description }}</p>
                        </template>
                        
                        <template v-else>
                            <h2>Restricted access</h2>
                            <br />
                            <p>You need to sign in to view courses</p>
                        </template>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    async mounted() {
        const slug = this.$route.params.slug;

        await axios
            .get(`api/v1/courses/${slug}/`)
            .then(response => {
                this.course = response.data
            })
            .catch((error) => {
                console.log(error);
            })

        document.title = this.course.title + ' | LMS'
    },
    data() {
        return {
            course: {
                created_by: {
                    id: 0,
                }
            },
        }
    },
    computed: {
        isAuthenticated() {
            return this.$store.state.user.isAuthenticated
        }
    },
}
</script>