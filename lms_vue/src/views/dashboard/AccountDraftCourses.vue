<template>
    <div>
        <h2 class="title is-4">My Drafted Courses</h2>
        <br />
        <template v-if="courses.length === 0" >
            <p>You haven't drafted any courses yet</p>
        </template>
        <template v-else >
            <CourseCardViewer :courses="courses" />
        </template>
    </div>
</template>

<script>
import axios from 'axios';
import CourseCardViewer from '../../components/CourseCardViewer.vue';

export default {
    components: {
        CourseCardViewer
    },
    async mounted() {
        await axios
            .get('/api/v1/courses/teacher/my_drafts/')
            .then(response => {
                console.log(response.data)
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