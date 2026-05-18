import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import AuthorCourses from "../AuthorCourses.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn()
    }
}))

describe('AuthorCourses.vue', () => {
    const mockResponse = {
        created_by: {
            id: 12,
            first_name: 'John',
            last_name: 'Doe'
        },
        courses: [
            { id: 1, title: 'Vue Basics', short_description: 'Intro to Vue' },
            { id: 2, title: 'Advanced Django', short_description: 'Django deep dive' },
            { id: 3, title: 'REST APIs', short_description: 'Build robust APIs' }
        ]
    }

    beforeEach(() => {
        document.title = ''
        vi.clearAllMocks()
        axios.get.mockResolvedValue({ data: mockResponse })
    })

    function mountAuthorCourses() {
        return mount(AuthorCourses, {
            global: {
                mocks: {
                    $route: {
                        params: {
                            user_id: 12
                        }
                    }
                },
                stubs: {
                    CourseCardViewer: {
                        props: ['courses'],
                        template: '<div class="viewer-stub">Viewer {{ courses.length }}</div>'
                    }
                }
            }
        })
    }

    it('fetched author courses on mount', async () => {
        mountAuthorCourses()
        await flushPromises()

        expect(axios.get).toHaveBeenCalledWith('/api/v1/courses/get_author_courses/12/')
        expect(axios.get).toHaveBeenCalledTimes(1)
    })

    it('renders the author name in the page title', async () => {
        const wrapper = mountAuthorCourses()
        await flushPromises()

        expect(wrapper.text()).toContain('Courses by John Doe')
    })

    it('passes fectched courses to CourseCardViewer', async () => {
        const wrapper = mountAuthorCourses()
        await flushPromises()

        expect(wrapper.find('.viewer-stub').text()).toContain('Viewer 3')
    })

    it('sets the document title on mount', async () => {
        mountAuthorCourses()
        await flushPromises()

        expect(document.title).toBe('Courses by John Doe | LMS')
    })
})