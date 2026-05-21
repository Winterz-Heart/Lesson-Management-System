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
                                v-model="form.categories"
                            >
                                {{ category.title }}
                            </input>
                        </label>
                    </div>
                </div>

                <div class="field">
                    <label>New Category</label>
                    <input
                        type="text"
                        class="input"
                        v-model="form.new_category"
                        placeholder="Optional: create a new category when saving"
                    />
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
            form: {
                title: '',
                short_description: '',
                long_description: '',
                categories: [],
                new_category: '',
                status: '',
            },
            categories: [],
            errors: [],
        }
    },
    mounted() {
        this.getCategories()
    },
    computed: {
        fetchCurrentUserRole() {
           return this.$store.state.user.role
        }
    },
    methods: {
        getCategories() {
            axios
                .get('/api/v1/courses/get_categories/')
                .then((response) => {
                this.categories = response.data;
                })
                .catch((error) => {
                    console.log(error)
                })
        },
        slugify(title) {
            let titleNoSpace = title.split(" ").join("-");
            let slug = titleNoSpace.toLowerCase();
            return slug;
        },
        async submitForm(status) {
            this.errors = []

            const courseSlugifyed = this.slugify(this.form.title)
            const existingCourseSlugs = await axios.get('api/v1/courses/')
            const courseIsDupe = existingCourseSlugs.data.some((course) => course.slug === courseSlugifyed)
            
            const newCategory = this.form.new_category.trim()
            const newCategorySlugifyed = this.slugify(newCategory)
            const existingCategorySlugs = await axios.get('api/v1/courses/get_categories/')
            const newCategoryIsDupe = existingCategorySlugs.data.some((category) => category.slug === newCategorySlugifyed)

            if (this.form.categories.length === 0 && !newCategory ) {
                this.errors.push('The Course must have at least one category')
            }

            if (this.form.title === "") {
                this.errors.push('The Course must have a title')
            }

            if (courseIsDupe) {
                this.errors.push('The Course must title must be unique')
            }

            if (newCategoryIsDupe) {
                this.errors.push('The new Category name must be unique')
            }

            if (this.form.short_description === "") {
                this.errors.push('The Course must have a Short Description')
            }

            if (this.form.long_description === "") {
                this.errors.push('The Course must have a Long Description')
            }

            if (!this.errors.length) {
                if (newCategory) {
                    await axios
                        .post('/api/v1/courses/teacher/create/categories/', {
                            title: newCategory,
                            slug: newCategorySlugifyed,
                        })
                        .then(response => {
                            this.form.categories.push(response.data.id)
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                }

                const payload = {
                    title: this.form.title,
                    short_description: this.form.short_description,
                    long_description: this.form.long_description,
                    categories: this.form.categories,
                    status: status,
                    slug: courseSlugifyed,
                }

                await axios
                    .post('/api/v1/courses/teacher/create/', payload)
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