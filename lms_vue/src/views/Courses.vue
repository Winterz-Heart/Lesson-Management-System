<template>
    <div class="about">
        <div class="hero is-info">
            <div class="hero-body has-text-centered">
                <h1 class="title">Courses</h1>
            </div>
        </div>
        
        <section class="section">
            <CourseCardViewer :courses="courses" />
        </section>
    </div>
</template>

<script>
import axios from 'axios';
import CourseCardViewer from '../components/CourseCardViewer.vue';

export default {
    components: {
        CourseCardViewer
    },
    async mounted() {
        await axios
            .get('/api/v1/courses/')
            .then(response => {
                this.courses = response.data
            })
            .catch((error) => {
                console.log(error)
            })

        document.title = 'Courses | LMS'
    },
    data() {
        return {
            courses: [],
        }
    },
}
</script>