<template>
    <div class="container">
        <div class="columns">
            <div class="column is-2" >
                <aside class="menu">
                    <p class="menu-label">Categories</p>
                    <ul class="menu-list">
                        <li @click="setActiveCategory(null)" >
                            <a v-bind:class="{ 'is-active': !activeCategory}" >All Categories</a>
                        </li>

                        <li
                            v-for="category in allCategories"
                            v-bind:key="category.id"
                            @click="setActiveCategory(category)"
                        >
                            <a v-bind:class="{ 'is-active': activeCategory && activeCategory.id === category.id }">
                                {{ category.title }}
                            </a>
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
                            :class="{ 'is-disabled': currentPage === totalPages || totalPages === 0 }"
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
</template>

<script>
import CourseCard from '../components/CourseCard.vue';

export default {
    components: {
        CourseCard
    },
    props: {
        courses: {
            type: Array,
            default: () => []
        },
        categories: {
            type: Array,
            default: () => []
        },
    },
    data() {
        return {
            currentPage: 1,
            perPage: 6,
            activeCategory: null,
        }
    },
    computed: {
        filteredCourses() {
            if (!this.activeCategory) {
                return this.courses
            }

            return this.courses.filter(course => {
                const courseCategories = Array.isArray(course.categories) ? course.categories : []
                return courseCategories.some(cat => cat.id === this.activeCategory.id)
            })
        },
        allCategories() {
            const categoryMap = new Map()
            
            this.courses.forEach(course => {
                const courseCategories = Array.isArray(course.categories) ? course.categories : []
                courseCategories.forEach(cat => {
                    if (cat && cat.id != null && !categoryMap.has(cat.id)) {
                        categoryMap.set(cat.id, cat)
                    }
                })
            })

            const derived = Array.from(categoryMap.values())

            if (derived.length > 0) {
                return derived.sort((a, b) => a.title.localeCompare(b.title))
            }

            return this.categories
        },
        totalPages() {
            return Math.ceil(this.filteredCourses.length / this.perPage)
        },
        paginatedCourses() {
            const start = (this.currentPage - 1) * this.perPage
            const end = start + this.perPage
            return this.filteredCourses.slice(start, end)
        },
        pages() {
            return Array.from({
                length: this.totalPages
            }, (_, index) => index + 1)
        },
    },
    methods: {
        setActiveCategory(category) {
            this.activeCategory = category
            this.currentPage = 1
        },
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
    }
}
</script>