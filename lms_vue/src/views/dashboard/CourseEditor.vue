<template>
    <section class="section">
        <template v-if="fetchCurrentUserRole === 'Teacher' || fetchCurrentUserRole === 'Admin'">
            <form>
                <div class="field">
                    <label>Categories</label>
                    <div class="control">
                        <label
                            class="checkbox mr-4"
                            v-for="category in categories"
                            v-bind:key="category.id"
                        >
                            <input
                                type="checkbox"
                                :value="category.id"
                                v-model="selectedCategories"
                                :id="'cat-' + category.id"
                            >
                                <label :for="'cat-' + category.id"> | {{ category.title }}</label>
                            </input>
                        </label>
                    </div>
                </div>

                <div class="field">
                    <label>Title</label>
                    <input type="text" class="input" v-model="form.title" />
                </div>

                <div class="field">
                    <label>Short Description</label>
                    <input type="text" class="input" v-model="form.short_description" />
                </div>

                <div class="field">
                    <label>Long Description</label>
                    <input type="text" class="textarea" v-model="form.long_description" />
                </div>

                <div
                    class="notification is-danger"
                    v-for="error in errors"
                    v-bind:key="error"
                >
                    {{ error }}
                </div>

                <div class="field buttons">
                    <button type="button" class="button is-info" @click="submitForm('draft')">Save as Draft</button>
                    <button type="button" class="button is-info" @click="submitForm('published')">Publish</button>
                    <button type="button" class="button is-danger" @click="deleteCourse()">Delete Course</button>
                </div>
            </form>
        </template>

        <template v-else>
            <p>You don't have permisson to make courses</p>
        </template>
    </section>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            course_id: null,
            course_slug: '',
            orginalSlug: '',
            form: {
                title: '',
                short_description: '',
                long_description: '',
                categories: [],
                status: '',
            },
            categories: [],
            selectedCategories: [],
            errors: [],
        }
    },
    async mounted() {
        this.course_slug  =this.$route.params.slug
        await this.getCategories()
        await this.getCourseDetails()
    },
    computed: {
        fetchCurrentUserRole() {
           return this.$store.state.user.role
        }
    },
    methods: {
        async getCategories() {
            await axios
                .get('/api/v1/courses/get_categories/')
                .then((response) => {
                this.categories = response.data;
                })
                .catch((error) => {
                    console.log(error)
                })
        },
        async getCourseDetails() {
            await axios
                .get(`/api/v1/courses/${this.course_slug}`)
                .then(response => {
                    const course = response.data

                    this.course_id = course.id
                    this.form.title = course.title
                    this.form.short_description = course.short_description
                    this.form.long_description = course.long_description
                    this.selectedCategories = Array.isArray(course.categories)
                        ? course.categories.map((cat) => (typeof cat === 'object' ? cat.id : cat))
                        : []
                    this.orginalSlug = course.slug
                })
                .catch((error) => {
                    console.log(error)
                })
        },
        async deleteCourse() {
            const confirmed = window.confirm(
                'Are you sure you wish to delete this course? This action cannot be undone.'
            )

            if (!confirmed) return

            await axios
                .delete(`/api/v1/courses/teacher/${this.course_id}/delete/`)
                .then(() => {
                    if (this.fetchCurrentUserRole === 'Teacher') {
                        const redirect = this.form.status === 'published'
                        ? '/dashboard/my-account/drafts'
                        : '/dashboard/my-account/published'

                        this.$router.push(redirect)
                    }

                    if (this.fetchCurrentUserRole === 'Admin') {
                        const redirect = this.form.status === 'published'
                        ? '/dashboard/admin/drafts'
                        : '/dashboard/admin/published'

                        this.$router.push(redirect)
                    }
                })
        },
        slugify(title) {
            let titleNoSpace = title.split(" ").join("-");
            let slug = titleNoSpace.toLowerCase();
            return slug;
        },
        async submitForm(status) {
            this.errors = []
            this.form.categories = [...this.selectedCategories]

            const slugifyed = this.slugify(this.form.title)
            const existingSlugs = await axios.get('api/v1/courses/')
            const slugChanged = slugifyed !== this.orginalSlug
            const isDupe = slugChanged && existingSlugs.data.some(
                (course) => course.slug === slugifyed && String(course.id) !== String(this.course_id)
            )

            if (this.form.categories.length === 0) {
                this.errors.push('The Course must have at least one category')
            }

            if (this.form.title === "") {
                this.errors.push('The Course must have a title')
            }

            if (isDupe) {
                this.errors.push('The Course must title must be unique')
            }

            if (this.form.short_description === "") {
                this.errors.push('The Course must have a Short Description')
            }

            if (this.form.long_description === "") {
                this.errors.push('The Course must have a Long Description')
            }

            if (!this.errors.length) {
                this.form.status = status
                const payload = {
                    ...this.form,
                    slug: slugifyed,
                }

                await axios
                    .patch(`/api/v1/courses/teacher/${this.course_id}/edit/`, payload)
                    .then(response => {
                        this.$router.push(`/courses/${response.data.slug}`)
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            }
        }
    }
}
</script>