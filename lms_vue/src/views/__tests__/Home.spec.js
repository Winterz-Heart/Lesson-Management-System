import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import Home from "../Home.vue";

vi.mock('axios')

const mockCourses = [
    { id: 1, title: 'Vue Basics', short_description: 'Intro to Vue' },
    { id: 2, title: 'Django Basics', short_description: 'Intro to Django' },
    { id: 3, title: 'UI Design', short_description: 'Design fundamentals' },
    { id: 4, title: 'Python', short_description: 'Python fundamentals' },
]

function mountHome() {
    return mount(Home, {
        global: {
            stubs: {
                CourseCard: {
                    name: 'CourseCard',
                    props: ['course'],
                    template: '<div class="course-card-stub">{{ course.title }}</div>',
                },
                RouterLink: {
                    template: '<a><slot /></a>'
                }
            }
        }
    })
}

describe('Home.vue', () => {
    beforeEach(() => {
        document.title = ''
        vi.clearAllMocks()
        axios.get.mockResolvedValue({ data: mockCourses })
    })

    it('renders the hero headings', () => {
        const wrapper = mountHome()

        expect(wrapper.text()).toContain('Welcome to LMS')
        expect(wrapper.text()).toContain('An online place for learning course and lessons')
    })

    it('renders the featured courses scetion text', () => {
        const wrapper = mountHome()

        expect(wrapper.text()).toContain('Here are some of our Courses!')
    })

    it('renders one CourseCard per course in data', async () => {
        const wrapper = mountHome()

        await flushPromises()

        expect(axios.get).toHaveBeenCalledWith('/api/v1/courses/get_frontpage_courses/')
        expect(wrapper.findAll('.course-card-stub')).toHaveLength(mockCourses.length)
    })

    it('renders the click to get started button text', () => {
        const wrapper = mountHome()

        expect(wrapper.text()).toContain('Click to get started!')
    })

    it('sets the document title on mount', async () => {
        mountHome()

        await flushPromises()

        expect(document.title).toBe('Home | LMS')
    })
})