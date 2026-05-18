import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import AccountCompleted from "../dashboard/AccountCompleted.vue";

vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
    },
}));

describe('AccountCompleted.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function mountAccountCompleted() {
        return mount(AccountCompleted, {
            global: {
                stubs: {
                    CourseCardViewer: {
                        name: 'CourseCardViewer',
                        props: ['courses'],
                        template: '<div class="viewer-stub">Viewer {{ courses.length }}</div>'
                    },
                },
            },
        });
    }

    it('shows not started any course when no courses completed', async () => {
        axios.get.mockResolvedValue({
            data: [
                {
                    status: 'started',
                    course: 1,
                    course_slug: 'vue-basics',
                    course_title: 'Vue Basics',
                    course_categories: [],
                },
            ],
        });

        const wrapper = mountAccountCompleted();
        await flushPromises();

        expect(axios.get).toHaveBeenCalledWith('/api/v1/courses/my_progress/');
        expect(wrapper.text()).toContain("You haven't finished any courses yet")
        expect(wrapper.find('.viewer-stub').exists()).toBe(false);
    })

    it('renders CourseCardViewer with only completed courses', async () => {
        axios.get.mockResolvedValue({
            data: [
                {
                    status: 'completed',
                    course: 1,
                    course_slug: 'vue-basics',
                    course_title: 'Vue Basics',
                    course_categories: ['frontend'],
                },
                {
                    status: 'started',
                    course: 2,
                    course_slug: 'django-advanced',
                    course_title: 'Django Advanced',
                    course_categories: ['backend'],
                },
                {
                    status: 'completed',
                    course: 3,
                    course_slug: 'rest-apis',
                    course_title: 'REST APIs',
                    course_categories: ['api'],
                },
            ],
        });

        const wrapper = mountAccountCompleted();
        await flushPromises()

        expect(wrapper.find('.viewer-stub').exists()).toBe(true);
        expect(wrapper.find('.viewer-stub').text()).toContain('Viewer 2');

        const viewer = wrapper.findComponent({ name: 'CourseCardViewer' });
        const coursesProp = viewer.props('courses');

        expect(coursesProp).toEqual([
            {
                id: 1,
                slug: 'vue-basics',
                title: 'Vue Basics',
                short_description: 'Finished',
                categories: ['frontend'],
            },
            {
                id: 3,
                slug: 'rest-apis',
                title: 'REST APIs',
                short_description: 'Finished',
                categories: ['api'],
            },
        ]);
    });
})