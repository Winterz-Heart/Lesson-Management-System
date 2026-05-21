<template>
    <div class="admin-all-courses-table">
        <h2 class="title is-size-4">All Courses</h2>

        <template v-if="fetchCurrentUserRole === 'Admin'">
            <section class="section">
                <table class="table is-fullwidth is-hoverable is-striped">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Course Title</th>
                            <th>Status</th>
                            <th>Created By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        <template
                            v-for="group in groupedCourses"
                            :key="group.categoryKey"
                        >
                            <tr
                                v-for="(course, index) in group.courses"
                                :key="`${group.categoryKey}-${course.id}`"
                            >
                                <td v-if="index === 0" :rowspan="group.courses.length">
                                    <div>
                                        <span>{{ group.categoryTitle }}</span>
                                        <br />
                                        <button
                                            class="button is-small is-danger mt-4"
                                        >
                                            Delete Category
                                        </button>
                                    </div>
                                </td>

                                <td>
                                    <router-link :to="{ name: 'course', params: { slug: course.slug} }">
                                        {{ course.title }}
                                    </router-link>
                                </td>

                                <td>
                                    {{ course.status }}
                                </td>

                                <td>
                                    {{ course.created_by.first_name }}  {{ course.created_by.last_name }}
                                </td>

                                <td>
                                    <button
                                        class="button is-danger is-small"
                                        @click="deleteCourse(course)"
                                    >
                                        Delete Course
                                    </button>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </section>
        </template>

        <template v-else-if="courses.length === 0 && fetchCurrentUserRole === 'Admin'">
            <p>No Courses have been made</p>
        </template>

        <template v-else>
            <p>Yoo do not have permission to view this page</p>
        </template>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            courses: [],
            errors: [],
        }
    },
    methods: {
        async loadCourses() {
            await axios
                .get('/api/v1/courses/')
                .then(response => {
                    this.courses = response.data
                    this.categories = [...new Set(this.courses.map(course => course.category))]
                })
                .catch((error) => {
                    console.log(error)
                })
        },
        async deleteCourse(course) {
            const confirmed = window.confirm(
                `Are you sure you wish to delete ${course.title}? This action cannot be undone.`
            )

            if (!confirmed) return

            this.error = ''

            await axios
                .delete(`/api/v1/courses/teacher/${course.id}/delete/`)
                .then(() => {
                    this.courses = this.courses.filter((currentCourse) => currentCourse.id !== course.id)
                })
                .catch((error) => {
                    console.log(error)
                })
            }
    },
    async mounted() {
        await this.loadCourses()
    },
    computed: {
        fetchCurrentUserRole() {
            return this.$store.state.user.role
        },
        groupedCourses() {
            const groups = {}

            this.courses.forEach((course) => {
                course.categories.forEach((category) => {
                    const categoryKey = category.id

                    if (!groups[categoryKey]) {
                        groups[categoryKey] = {
                            categoryKey: category.id,
                            categoryId: category.id,
                            categoryTitle: category.title,
                            courses: []
                        }
                    }

                    groups[categoryKey].courses.push(course)
                })
            })

            return Object.values(groups)
                .sort((a, b) => a.categoryTitle.localeCompare(b.categoryTitle))
                .map((group) => ({
                    ...group,
                    courses: [...group.courses].sort((a, b) => a.title.localeCompare(b.title))
                }))
        }
    }
}
</script>