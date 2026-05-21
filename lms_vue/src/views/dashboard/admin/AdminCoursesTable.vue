<template>
    <div class="admin-all-courses-table">
        <h2 class="title is-size-4">All Courses</h2>

        <template v-if="fetchCurrentUserRole === 'Admin'">
            <template v-if="courses.length > 0">
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
                                                @click="deleteCategory(group)"
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
                                        <div class="is-flex is-align-items-center">
                                            {{ course.status }}
                                            <button
                                                v-if="course.status === 'draft'"
                                                class="button is-success is-small ml-auto"
                                                @click="changeCourseStatus(course, 'published')"
                                            >
                                                Publish
                                            </button>
                                            <button
                                                v-if="course.status === 'published'"
                                                class="button is-warning is-small ml-auto"
                                                @click="changeCourseStatus(course, 'draft')"
                                            >
                                                Mark as Draft
                                            </button>
                                        </div>
                                    </td>

                                    <td>
                                        <router-link :to="{ name: 'teacher-courses', params: { user_id: course.created_by.id } }">
                                            {{ course.created_by.first_name }}  {{ course.created_by.last_name }}
                                        </router-link>
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

            <template v-else>
                <p>No Courses have been made</p>
            </template>
        </template>

        <template v-else>
            <p>You do not have permission to view this page</p>
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
        async changeCourseStatus(course, newStatus){
            await axios
                .patch(`/api/v1/courses/teacher/${course.id}/edit/`, {
                    status: newStatus
                })
                .then(() => {
                    this.loadCourses()
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
        },
        async deleteCategory(group) {
            const confirmed = window.confirm(
                `Are you sure you wish to delete ${group.categotyTitle}? This action cannot be undone nad will delete any course that arent in other categories as well.`
            )

            if (!confirmed) return

            this.error = ''

            await axios
                .delete(`/api/v1/courses/admin/categories/delete/${group.categoryId}/`)
                .then(() => {
                    this.loadCourses()
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