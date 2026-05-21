import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import CourseCreator from "../dashboard/CourseCreator.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}))

describe('CourseCreator.vue', () => {
    let push;

    function mountCourseCreator(role='Teacher') {
        return mount(CourseCreator, {
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
                    }
                }
            }
        })
    }

    beforeEach(() => vi.clearAllMocks())

    it('blocks non-teacher/admin users', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });

        const wrapper = mountCourseCreator('Student');
        await flushPromises();

        expect(wrapper.text()).toContain("You don't have permisson to make courses");
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('shows required-field validation errors', async () => {
        axios.get
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] })

        const wrapper = mountCourseCreator('Teacher');
        await flushPromises();

        const draftBtn = wrapper.findAll('button.button.is-info')[0];
        await draftBtn.trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('The Course must have at least one category');
        expect(wrapper.text()).toContain('The Course must have a title');
        expect(wrapper.text()).toContain('The Course must have a Short Description');
        expect(wrapper.text()).toContain('The Course must have a Long Description');
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('submits a valid draft and redirects', async () => {
        axios.get
            .mockResolvedValueOnce({ data: [{ id: 1, title: 'Frontend', slug: 'frontend' }] })
            .mockResolvedValueOnce({ data: [{ slug: 'other-course' }] })
            .mockResolvedValueOnce({ data: [{ id: 1, title: 'Frontend', slug: 'frontend' }] })

        axios.post.mockResolvedValueOnce({ data: { slug: 'vue-basics' } });

        const wrapper = mountCourseCreator('Teacher');
        await flushPromises();

        wrapper.vm.form.title = 'Vue Basics';
        wrapper.vm.form.short_description = 'Intro';
        wrapper.vm.form.long_description = 'Long text';
        wrapper.vm.form.categories = [1];

        const draftBtn = wrapper.findAll('button.button.is-info')[0];
        await draftBtn.trigger('click');
        await flushPromises();

        expect(axios.post).toHaveBeenCalledWith('/api/v1/courses/teacher/create/', {
            title: 'Vue Basics',
            short_description: 'Intro',
            long_description: 'Long text',
            categories: [1],
            status: 'draft',
            slug: 'vue-basics',
        });
        expect(push).toHaveBeenCalledWith('/courses/vue-basics');
    });

    it('creates a new category, attaches it to course and redirects', async () => {
        axios.get
            .mockResolvedValueOnce({ data: [{ id: 1, title: 'Frontend', slug: 'frontend' }] })
            .mockResolvedValueOnce({ data: [{ slug: 'other-course' }] })
            .mockResolvedValueOnce({ data: [{ id: 1, title: 'Frontend', slug: 'frontend' }] })

        axios.post
            .mockResolvedValueOnce({ data: { id: 99, title: 'Backend', slug: 'backend' } })
            .mockResolvedValueOnce({ data: { slug: 'vue-basics' } })

        const wrapper = mountCourseCreator('Teacher')
        await flushPromises()

        wrapper.vm.form.title = 'Vue Basics'
        wrapper.vm.form.short_description = 'Intro'
        wrapper.vm.form.long_description = 'Long text'
        wrapper.vm.form.new_category = 'Backend'
        wrapper.vm.form.categories = [1]

        const draftBtn = wrapper.findAll('.button.button.is-info')[0]
        await draftBtn.trigger('click')
        await flushPromises()

        expect(axios.post).toHaveBeenNthCalledWith(
            1,
            '/api/v1/courses/teacher/create/categories/',
            {
                title: 'Backend',
                slug: 'backend',
            }
        )

        expect(axios.post).toHaveBeenNthCalledWith(
            2,
            '/api/v1/courses/teacher/create/',
            {
                title: 'Vue Basics',
                short_description: 'Intro',
                long_description: 'Long text',
                categories: [1, 99],
                status: 'draft',
                slug: 'vue-basics',
            }
        )

        expect(push).toHaveBeenCalledWith('/courses/vue-basics')
    })
})