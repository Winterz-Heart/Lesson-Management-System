<template>
    <div class="about">
        <div class="hero is-info">
            <div class="hero-body has-text-centered">
                <h1 class="title">Courses</h1>
            </div>
        </div>
        
        <section class="section">
            <div class="container">
                <div class="columns">
                    <div class="column is-2" >
                        <aside class="menu">
                            <p class="menu-label">Categories</p>
                            <ul class="menu-list">
                                <li><a>All Catergories</a></li>
                                <li><a>Programming</a></li>
                                <li><a>Design</a></li>
                                <li><a>UX</a></li>
                            </ul>
                        </aside>
                    </div>

                    <div class="column is-10">
                        <div class="columns is-multiline">
                            <div v-for="cardNumber in 9" :key="cardNumber" class="column is-4">
                                <CourseCard />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import CourseCard from '../components/CourseCard.vue';

export default {
    components: {
        CourseCard
    }
}
</script>