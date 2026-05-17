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
                                <li @click="setActiveCategory(null)" >
                                    <a v-bind:class="{ 'is-active': !activeCategory}" >All categories</a>
                                </li>
                                <li
                                    v-for="category in categories"
                                    v-bind:key="category"
                                    @click="setActiveCategory(category)"
                                >
                                    <a v-bind:class="{ 'is-active': activeCategory === category }">{{ category.title }}</a>
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
            categories: [],
            currentPage: 1,
            perPage: 6,
            activeCategory: null,
        }
    },
    async mounted() {
        await axios
            .get('/api/v1/courses/get_categories/')
            .then(response => {
                this.categories = response.data
            })

        this.getCourses()

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
        },
        setActiveCategory(category) {
            this.activeCategory = category
            this.currentPage = 1
            this.getCourses()
        },
        getCourses() {
            let url = "/api/v1/courses/";

            if (this.activeCategory) {
                url += "?category_id=" + this.activeCategory.id;
            }

            axios.get(url).then(response => {
                this.courses = response.data;
            })
        },
    }
}
</script>