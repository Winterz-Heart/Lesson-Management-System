<template>
    <div class="about">
        <div class="hero is-info">
            <div class="hero-body has-text-centered">
                <h1 class="title">Courses by {{ this.teacher.first_name  + ' ' + this.teacher.last_name }}</h1>
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
    data() {
        return {
            teacher: {
                id: 0,
                first_name: '',
                last_name: ''
            },
            courses: [],
        }
    },
    async mounted() {
        const user_id = this.$route.params.user_id;

        await axios
            .get(`/api/v1/courses/get_teacher_courses/${user_id}/`)
            .then(response => {
                this.courses = response.data.courses
                this.teacher = response.data.created_by
            })
            .catch((error) => {
                console.log(error)
            })

        document.title = `Courses by ${this.teacher.first_name} ${this.teacher.last_name} | LMS`
    },
};
</script>