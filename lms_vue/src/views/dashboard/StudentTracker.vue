<template>
    <section class="section">
        <template v-if="fetchCurrentUserRole === 'teacher' || fetchCurrentUserRole === 'admin'">
            <h2 class="title is-4">Student Progress</h2>

            <table class="table is-fullwidth is-hoverable" >
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Started</th>
                        <th>Completed</th>
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
                        </tr>

                        <tr v-if="student.courses_progress.length === 0">
                            <td>{{ student.first_name }} {{ student.last_name }}</td>
                            <td colspan="4">No courses enrolled</td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </template>

        <template v-else>
            <p>You don't have permisson to view student progress</p>
        </template>
    </section>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            students: [],
        }
    },
    computed: {
        fetchCurrentUserRole() {
           return this.$store.state.user.role
        }
    },
    async mounted() {
        await axios
            .get('/api/v1/courses/teacher/student-progress-table/')
            .then(response => {
                this.students = response.data
            })
            .catch((error) => {
                console.log(error)
            })
    },
}
</script>