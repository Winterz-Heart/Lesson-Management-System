import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import CourseEditor from "../dashboard/CourseEditor.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn()
    }
}))

describe('CourseEditor.vue', () => {
    let push;

    function mountCourseEditor(role='teacher') {
        return mount(CourseEditor, {
            global: {
                mocks: {
                    $store: {
                        state: {
                            user: {
                                role: role
                            }
                        }
                    },
                    $router: {
                        push: (push = vi.fn())
                    },
                    $routes: {
                        params: {
                            course_id: 1
                        }
                    }
                }
            }
        })
    }

    beforeEach(() => vi.clearAllMocks())

    it('blocks non-teacher/admin users', async () => {
        axios.get
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({
                data: [
                    {
                    id: 1,
                    title: '',
                    short_description: '',
                    long_description: '',
                    categories: [],
                    slug: 'old-title'
                    }
                ]
            })

        const wrapper = mountCourseEditor('student');
        await flushPromises();

        expect(wrapper.text()).toContain("You don't have permisson to make courses");
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('shows required-field validation errors', async () => {
        axios.get
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({
            data: [
                {
                    id: 1,
                    title: '',
                    short_description: '',
                    long_description: '',
                    categories: [],
                    slug: 'old-title'
                    }
            ]
        })
        .mockResolvedValueOnce({ data: [] })

        const wrapper = mountCourseEditor('teacher');
        await flushPromises();

        const draftBtn = wrapper.findAll('button.button.is-info')[0];
        await draftBtn.trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('The Course must have at least one category');
        expect(wrapper.text()).toContain('The Course must have a title');
        expect(wrapper.text()).toContain('The Course must have a Short Description');
        expect(wrapper.text()).toContain('The Course must have a Long Description');
        expect(axios.patch).not.toHaveBeenCalled();
    })

    it('submits a valid draft and redirects', async () => {
        axios.get
            .mockResolvedValueOnce({ data: [{ id: 1, title: 'Frontend' }] })
            .mockResolvedValueOnce({ 
                data: [
                    {
                        id: 1,
                        title: 'Old Title',
                        short_description: 'Old short',
                        long_description: 'Old long',
                        categories: [{ id: 1, title: 'Frontend' }],
                        slug: 'old-title'
                    }
                ]
            })
            .mockResolvedValueOnce({ data: [{ id: 2, slug: 'other-course' }] })

        axios.patch.mockResolvedValueOnce({ data: { slug: 'vue-basics' } });

        const wrapper = mountCourseEditor('teacher');
        await flushPromises();

        wrapper.vm.form.title = 'Vue Basics';
        wrapper.vm.form.short_description = 'Intro';
        wrapper.vm.form.long_description = 'Long text';
        wrapper.vm.form.categories = [1];

        const draftBtn = wrapper.findAll('button.button.is-info')[0];
        await draftBtn.trigger('click');
        await flushPromises();

        expect(axios.patch).toHaveBeenCalledWith(
            '/api/v1/courses/teacher/1/edit/', 
            expect.objectContaining({
                title: 'Vue Basics',
                short_description: 'Intro',
                long_description: 'Long text',
                categories: [1],
                status: 'draft',
                slug: 'vue-basics',
            })
        )
        expect(push).toHaveBeenCalledWith('/courses/vue-basics');
    });
})