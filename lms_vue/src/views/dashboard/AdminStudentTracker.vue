<template>
    <div class="admin-tudent-tracker">
        <h2 class="title is-4">Admin Student Tracker</h2>
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
                <button @click="addStudentToCourse()">Add Student to Course</button>
                <span v-if="addError" class="notifcation is-danger">
                    {{ addError }}
                </span>
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
                                <select>
                                    <option>Not Started</option>
                                    <option>Started</option>
                                    <option>Completed</option>
                                </select>
                            </td>

                            <td>{{ course_progress.started_at ? new Date(course_progress.started_at).toLocaleDateString() : '-' }}</td>
                            <td>{{ course_progress.completed_at ? new Date(course_progress.completed_at).toLocaleDateString() : '-' }}</td>

                            <td>
                                <button>Mark Completed</button>
                                <button>Remove</button>
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
export default {
    data() {
        return {
            students: [],
            courses: [],
            categories: [],
            selectedStudentID: '',
            selectedCourseID: '',
            addError: '',
        }
    },
    methods: {
        loadStudentProgress() {
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
                    .post('/api/v1/courses/admin/student-progress/create', {
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
        markCompleted() {
            
        },
        removeCourse() {

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