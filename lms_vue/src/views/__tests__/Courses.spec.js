import { describe, it, expect, before, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import Courses from "../Courses.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn()
    }
}))

describe('Courses.vue', () => {
    const mockCategories = [
        { id: 1, title: 'Web Development' },
        { id: 2, title: 'Data Science' }
    ]

    const mockCourses = [
        { id: 1, title: 'Vue Basics', short_description: 'Intro to Vue' },
        { id: 2, title: 'Django Basics', short_description: 'Intro to Django' },
        { id: 3, title: 'Python 101', short_description: 'Python fundamentals' },
        { id: 4, title: 'React Basics', short_description: 'Intro to React' },
        { id: 5, title: 'TypeScript', short_description: 'Advanced TypeScript' },
        { id: 6, title: 'Node.js', short_description: 'Node.js backend' },
        { id: 7, title: 'GraphQL', short_description: 'GraphQL API' },
        { id: 8, title: 'MongoDB', short_description: 'NoSQL database' }
    ]

    beforeEach(() => {
        document.title = ''
        vi.clearAllMocks()
        axios.get.mockImplementation(url => {
            if (url.includes('/api/v1/courses/get_categories/')) {
                return Promise.resolve({ data: mockCategories })
            }
            return Promise.resolve({ data: mockCourses })
        })
    })

    function mountCourses() {
        return mount(Courses, {
            global: {
                stubs: {
                    CourseCard: {
                        props: ['course'],
                        template: '<div class="course-card">{{ course.title }}</div>'
                    }
                }
            }
        })
    }

    it('renders the Courses title', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        expect(wrapper.text()).toContain('Courses')
    })

    it('sets the document title on mount', async () => {
        mountCourses()
        await flushPromises()

        expect(document.title).toBe('Courses | LMS')
    })

    it('fetches categories and courses on mount', async () => {
        mountCourses()
        await flushPromises()

        expect(axios.get).toHaveBeenCalledWith('/api/v1/courses/get_categories/')
        expect(axios.get).toHaveBeenCalledWith('/api/v1/courses/')
    })

    it('renders category menu with all categories', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        expect(wrapper.text()).toContain('All categories')
        expect(wrapper.text()).toContain('Web Development')
        expect(wrapper.text()).toContain('Data Science')
    })

    it('shows "All Categories" as active on initial load', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        const allCategoriesLink = wrapper.find('li a:first-of-type')
        expect(allCategoriesLink.classes()).toContain('is-active')
    })

    it('renders paginated courses (6 per page)', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        const courseCards = wrapper.findAll('.course-card')
        expect(courseCards).toHaveLength(6)
    })

    it('calculates correct page total', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        expect(wrapper.vm.totalPages).toBe(2)
    })

    it('disables Previous button of first page', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        const prevButton = wrapper.find('.pagination-previous')
        expect(prevButton.classes()).toContain('is-disabled')
    })

    it('enables next button on first page when there is at least one more', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        const nextButton = wrapper.find('a.pagination-next')
        expect(nextButton.classes()).not.toContain('is-disabled')
    })

    it('navigates to next page when Next is clicked, enables Previous button', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        const nextButton = wrapper.find('.pagination-next')
        await nextButton.trigger('click')

        expect(wrapper.vm.currentPage).toBe(2)
        expect(wrapper.find('a.pagination-previous').classes()).not.toContain('is-disabled')
    })

    it('filters courses by category when category is selected', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        await wrapper.vm.setActiveCategory(mockCategories[0])
        await flushPromises()

        expect(axios.get).toHaveBeenCalledWith('/api/v1/courses/?category_id=1')
        expect(wrapper.vm.activeCategory).toEqual(mockCategories[0])
    })

    it('resets pagination when filtering by category', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        // go to page 2
        await wrapper.vm.nextPage()
        expect(wrapper.vm.currentPage).toBe(2)

        // select category (should reset page)
        await wrapper.vm.setActiveCategory(mockCategories[0])
        await flushPromises()

        expect(wrapper.vm.currentPage).toBe(1)
    })

    it('renders all pages in pagination list', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        const pageLinks = wrapper.findAll('a.pagination-link')
        expect(pageLinks).toHaveLength(2)
        expect(pageLinks[0].text()).toBe('1')
        expect(pageLinks[1].text()).toBe('2')
    })

    it('marks current page as active in pagination', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        const firstPageLink = wrapper.findAll('a.pagination-link')[0]
        expect(firstPageLink.classes()).toContain('is-current')
    })
})