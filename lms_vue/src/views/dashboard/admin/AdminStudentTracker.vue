<template>
    <div class="admin-tudent-tracker">
        <h2 class="title is-4">Adjust Student Progress</h2>
        <template v-if="fetchCurrentUserRole === 'admin'">
            <div>
                <p>Add student to course:</p>
                <select v-model="selectedStudentID">
                    <option value="">Select Student</option>
                    <option
                        v-for="student in students"
                        :key="student.id"
                        :value="student.id"
                    >
                        {{ student.first_name }} {{ student.last_name }}
                    </option>
                </select>
                <select v-model="selectedCourseID">
                    <option value="">Select Course</option>
                    <option
                        v-for="course in courses"
                        :key="course.id"
                        :value="course.id"
                    >
                        {{ course.title }}
                    </option>
                </select>
                <button
                    class="button is-success is-small ml-4 mb-4"
                    @click="addStudentToCourse()"
                    
                >
                    Add Student to Course
                </button>
                <span v-if="addError" class="button is-danger ml-4" role="status">
                    {{ addError }}
                </span>
            </div>

            <div class="notification is-danger" v-if="errors.length">
                <p
                    v-for="error in errors"
                    v-bind:key="error"
                >
                    {{ error }}
                </p>
            </div>

            <table class="table is-fullwidth is-hoverable" >
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Started</th>
                        <th>Completed</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <template v-for="student in students" :key="student.id">
                        <tr
                        v-for="(course_progress, index) in student.courses_progress"
                        :key="course_progress.id"
                        >
                            <td v-if="index === 0" :rowspan="student.courses_progress.length">
                                {{ student.first_name }} {{ student.last_name }}
                            </td>

                            <td>{{ course_progress.course_title }}</td>

                            <td>
                                <span
                                class="tag"
                                :class="{
                                    'is-success': course_progress.status === 'completed',
                                    'is-warning': course_progress.status === 'started'
                                }"
                                >
                                {{ course_progress.status }}
                                </span>
                            </td>

                            <td>{{ course_progress.started_at ? new Date(course_progress.started_at).toLocaleDateString() : '-' }}</td>
                            <td>{{ course_progress.completed_at ? new Date(course_progress.completed_at).toLocaleDateString() : '-' }}</td>

                            <td>
                                <button
                                    v-if="course_progress.status === 'started'"
                                    class="button is-small is-success"
                                    @click="markCompleted(course_progress.id)"
                                >
                                    Mark Completed
                                </button>
                                <button
                                    v-if="course_progress.status === 'completed'"
                                    class="button is-small is-warning"
                                    @click="markStarted(course_progress.id)"
                                >
                                    Mark Started
                                </button>
                                <button
                                    class="button is-small is-danger"
                                    @click="removeStudentFromCourse(course_progress.id)"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>

                        <tr v-if="student.courses_progress.length === 0">
                            <td>{{ student.first_name }} {{ student.last_name }}</td>
                            <td colspan="5">No courses enrolled</td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </template>

        <template v-else>
            <p>You don't have permisson to adjust student progress</p>
        </template>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            students: [],
            courses: [],
            categories: [],
            selectedStudentID: '',
            selectedCourseID: '',
            addError: '',
            errors: [],
        }
    },
    methods: {
        async loadStudentProgress() {
            return axios
                .get('/api/v1/courses/teacher/student-progress-table/')
                .then(response => {
                    this.students = response.data
                })
                .catch((error) => {
                    console.log(error)
                })
        },
        async addStudentToCourse() {
            this.addError = ''

            if (!this.selectedStudentID || !this.selectedCourseID) {
                this.addError = 'Both Student and Course must be selected to add'
            }

            if (!this.addError) {
                await axios
                    .post('/api/v1/courses/admin/student-progress/create/', {
                        user: this.selectedStudentID,
                        course: this.selectedCourseID
                    })
                    .then(() => {
                        this.selectedStudentID = ''
                        this.selectedCourseID = ''
                        return this.loadStudentProgress()
                    })
                    .catch((error) => {
                        this.addError = error?.response?.data?.detail || 'Could not add student to course.'
                    })
                }
            },
        markCompleted(progressId) {
            axios
                .patch(`/api/v1/courses/admin/student-progress/update/${progressId}/`, {
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                })
                .then(() => {
                    return this.loadStudentProgress()
                })
                .catch((error) => {
                    this.error = error?.response?.data?.detail || 'Could not mark course as completed.'
                })
        },
        markStarted(progressId) {
            axios
                .patch(`/api/v1/courses/admin/student-progress/update/${progressId}/`, {
                    status: 'started',
                    started_at: new Date().toISOString(),
                    completed_at: null
                })
                .then(() => {
                    return this.loadStudentProgress()
                })
                .catch((error) => {
                    this.error = error?.response?.data?.detail || 'Could not mark course as started.'
                })
        },
        removeStudentFromCourse(progressId) {
            axios
                .delete(`/api/v1/courses/admin/student-progress/delete/${progressId}/`)
                .then(() => {
                    return this.loadStudentProgress()
                })
                .catch((error) => {
                    this.error = error?.response?.data?.detail || 'Could not remove student from course.'
                })
        },
    },
    computed: {
        fetchCurrentUserRole() {
           return this.$store.state.user.role
        }
    },
    async mounted() {
        await this.loadStudentProgress()
        
        await axios
            .get('/api/v1/courses/?status=published')
            .then(response => {
                this.courses = response.data
                this.categories = [...new Set(this.courses.map(course => course.category))]
            })
            .catch((error) => {
                console.log(error)
            })
    }
}
</script>

<style>
.button[role='status'] {
    pointer-events: none;
    cursor: default;
}
</style>