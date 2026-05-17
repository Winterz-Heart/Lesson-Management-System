<template>
    <div class="about">
        <div class="hero is-info">
            <div class="hero-body has-text-centered">
                <h1 class="title">Courses</h1>
            </div>
        </div>
        
        <section class="section">
            <div class="container">
                <div class="columns">
                    <div class="column is-2" >
                        <aside class="menu">
                            <p class="menu-label">Categories</p>
                            <ul class="menu-list">
                                <li><a>All Catergories</a></li>
                                <li
                                    v-for="catergory in catergories"
                                    v-bind:key="catergory.id"
                                >
                                    <a>{{ catergory.title }}</a>
                                </li>
                                
                            </ul>
                        </aside>
                    </div>

                    <div class="column is-10">
                        <div class="columns is-multiline">
                            <div
                                v-for="course in paginatedCourses"
                                :key="course.id"
                                class="column is-4"
                            >
                                <CourseCard :course="course" />
                            </div>
                        </div>

                        <div class="column is-12">
                            <nav class="pagination">
                                <a
                                    class="pagination-previous"
                                    :class="{ 'is-disabled': currentPage === 1 }"
                                    @click.prevent="prevPage()"
                                >
                                    Previous
                                </a>
                                <a
                                    class="pagination-next"
                                    :class="{ 'is-disabled': currentPage === totalPages }"
                                    @click.prevent="nextPage()"
                                >
                                    Next
                                </a>

                                <ul class="pagination-list">
                                    <li
                                        v-for="page in pages"
                                        :key="page"
                                    >
                                        <a
                                            href="#"
                                            class="pagination-link"
                                            :class="{ 'is-current': page === currentPage }"
                                            @click.prevent="goToPage(page)"
                                        >
                                        {{ page }}
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import axios from 'axios';
import CourseCard from '../components/CourseCard.vue';

export default {
    components: {
        CourseCard
    },
    data() {
        return {
            courses: [],
            catergories: [],
            currentPage: 1,
            perPage: 6,
        }
    },
    async mounted() {
        await axios
            .get('api/v1/courses/')
            .then(response => {
                this.courses = response.data
            })

        await axios
            .get('api/v1/courses/get_catergories/')
            .then(response => {
                this.catergories = response.data
            })

        document.title = 'Courses | LMS'
    },
    computed: {
        totalPages() {
            return Math.ceil(this.courses.length / this.perPage)
        },
        paginatedCourses() {
            const start = (this.currentPage - 1) * this.perPage
            const end = start + this.perPage
            return this.courses.slice(start, end)
        },
        pages() {
            return Array.from({
                length: this.totalPages
            }, (_, index) => index + 1)
        },
    },
    methods: {
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page
            }
        },
        nextPage() {
            this.goToPage(this.currentPage + 1)
        },
        prevPage() {
            this.goToPage(this.currentPage - 1)
        }
    }
}
</script>