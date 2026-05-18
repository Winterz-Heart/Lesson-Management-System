<template>
    <div>
        <h2 class="title is-4">My Finished Courses</h2>
        <br />
        <template v-if="courses.length === 0" >
            <p>You haven't finished any courses yet</p>
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
            .get('/api/v1/courses/my_progress/')
            .then(response => {
                this.courses = response.data
                    .filter(item => item.status === 'completed')
                    .map(item => ({
                        id: item.course,
                        slug: item.course_slug,
                        title: item.course_title,
                        short_description: 'Finished',
                        categories: item.course_categories,
                    }))
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