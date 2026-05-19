import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import Courses from "../Courses.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn()
    }
}))

describe('Courses.vue', () => {
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
        axios.get.mockResolvedValue({ data: mockCourses })
    })

    function mountCourses() {
        return mount(Courses, {
            global: {
                stubs: {
                    CourseCardViewer: {
                        props: ['courses'],
                        template: '<div class="viewer-stub">Viewer {{ courses.length }}</div>'
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

    it('fetches courses on mount', async () => {
        mountCourses()
        await flushPromises()

        expect(axios.get).toHaveBeenCalledWith('/api/v1/courses/?status=published')
        expect(axios.get).toHaveBeenCalledTimes(1)
    })

    it('passes fetched courses to CourseCardViewer', async () => {
        const wrapper = mountCourses()
        await flushPromises()

        expect(wrapper.find('.viewer-stub').text()).toContain('Viewer 8')
    })    
})