<template>
    <div class="about">
        <div class="hero is-info">
            <div class="hero-body has-text-centered">
                <h1 class="title">{{ course.title }}</h1>
                <router-link
                    :to="{ name: 'teacher-courses', params: { user_id: course.created_by.id } }"
                    class="subtitle"
                >
                    By {{ course.created_by.first_name + " " + course.created_by.last_name }}
                </router-link>
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
                            <div class="is-flex is-justify-content is-align-items-right">
                                <template v-if="fetchCurrentUserRole === 'student'">
                                    <p class="tag is-info ml-auto mr-1 mb-2">{{ statusLabel }}</p>
                                    <button
                                        v-if="progress.status === 'not_started'"
                                        @click="markStarted()"
                                        class="tag is-info">
                                        Click to start Course    
                                    </button>
                                    <button
                                        v-if="progress.status === 'started'"
                                        @click="markCompleted()"
                                        class="tag is-info">
                                        Click to finish Course
                                    </button>
                                </template>

                                <template v-if="fetchCurrentUserRole === 'teacher' || fetchCurrentUserRole === 'admin'">
                                    <p class="tag is-info ml-auto">{{ pubOrDraft }}</p>
                                    <template v-if="isCreator">
                                        <router-link
                                        class="tag is-info"
                                        :to="{ name: 'my-account-course-edit', params: { course_id: course.id } }"
                                        >
                                            Click to Edit
                                        </router-link>
                                    </template>
                                    
                                </template>
                            </div>
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

        await axios
            .get(`api/v1/courses/${this.course.id}/course_progress/`)
            .then(response => {
                this.progress = response.data
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
            progress: {
                status: 'not_started',
            },
        }
    },
    methods: {
        async markStarted() {
            try {
                const response = await axios.post(`api/v1/courses/${this.course.id}/start/`)
                this.progress = response.data
            } catch (error) {
                console.log(error)
            }
        },
        async markCompleted() {
            try {
                const response = await axios.post(`api/v1/courses/${this.course.id}/complete/`)
                this.progress = response.data
            } catch (error) {
                console.log(error)
            }
        },
        
    },
    computed: {
        isAuthenticated() {
            return this.$store.state.user.isAuthenticated
        },
        isCreator() {
            return this.$store.state.user.id === this.course.created_by.id
        },
        statusLabel() {
            const map = {
                not_started: 'Not Started',
                started: 'Started',
                completed: 'Completed',
            }

            return map[this.progress.status] || 'Not Started'
        },
        fetchCurrentUserRole() {
            return this.$store.state.user.role
        },
        pubOrDraft() {
            return this.course.status === 'published' ? 'Published' : 'Draft'
        },
    },
}
</script>