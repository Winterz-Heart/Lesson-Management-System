<template>
    <div>
        <h2 class="title is-4">All Drafted Courses</h2>
        <br />
        <template v-if="courses.length === 0" >
            <p>No courses have been drafted yet</p>
        </template>
        <template v-else >
            <CourseCardViewer :courses="courses" />
        </template>
    </div>
</template>

<script>
import axios from 'axios';
import CourseCardViewer from '../../../components/CourseCardViewer.vue';

export default {
    components: {
        CourseCardViewer
    },
    async mounted() {
        await axios
            .get('/api/v1/courses/admin/drafts/')
            .then(response => {
                this.courses = response.data
            })
            .catch((error) => {
                console.log(error)
            })
    },
    data() {
        return {
            courses: []
        }
    }
}
</script>