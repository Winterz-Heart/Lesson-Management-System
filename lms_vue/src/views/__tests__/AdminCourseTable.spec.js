import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import AdminCoursesTable from "../dashboard/admin/AdminCoursesTable.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    }
}))

describe('AdminCourseTable.vue', () => {
    function mountAdminCoursesTable(role = 'Admin') {
        return mount(AdminCoursesTable, {
            global: {
                mocks: {
                    $store: {
                        state: {
                            user: {
                                role: role,
                            }
                        }
                    }
                },
                stubs: {
                    'router-link': {
                        props: ['to'],
                        template: '<a><slot /></a>'
                    }
                }
            }
        })
    }

    const coursesResponse = [
        {
            id: 1,
            slug: 'api-design',
            title: 'API Design',
            status: 'draft',
            created_by: {
                id: 10,
                first_name: 'Ada',
                last_name: 'Lovelace',
            },
            categories: [
                {
                    id: 2,
                    title: 'Backend'
                },
            ],
        },
        {
            id: 2,
            slug: 'vue-basics',
            title: 'Vue Basics',
            status: 'published',
            created_by: {
                id: 11, 
                first_name: 'Grace',
                last_name: 'Hopper'
            },
            categories: [
                {
                    id: 1,
                    title: 'Frontend'
                },
            ],
        },
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('loads courses on mount and renders admin table', async () => {
        axios.get.mockResolvedValueOnce({
            data: coursesResponse,
        });

        const wrapper = mountAdminCoursesTable('Admin')
        await flushPromises()

        expect(axios.get).toHaveBeenCalledWith('/api/v1/courses/')
        expect(wrapper.text()).toContain('All Courses')
        expect(wrapper.text()).toContain('Backend')
        expect(wrapper.text()).toContain('Frontend')
        expect(wrapper.text()).toContain('API Design')
        expect(wrapper.text()).toContain('Vue Basics')
        expect(wrapper.find('table').exists()).toBe(true)
    })

    it('shows permission message for non-admin users', async () => {
        axios.get.mockResolvedValueOnce({
            data: coursesResponse,
        });

        const wrapper = mountAdminCoursesTable('Student')
        await flushPromises()

        expect(wrapper.text()).toContain('You do not have permission to view this page')
        expect(wrapper.find('table').exists()).toBe(false)
    })

    it('publishes a course and reload courses', async () => {
        axios.get
            .mockResolvedValueOnce({ data: coursesResponse })
            .mockResolvedValueOnce({
                data: [
                    { ...coursesResponse[0], status: 'published' },
                    coursesResponse[1],
                ]
            })

        axios.patch.mockResolvedValueOnce({})

        const wrapper = mountAdminCoursesTable('Admin')
        await flushPromises()

        const publishBtn = wrapper.findAll('button').find((button) => button.text() === 'Publish')
        await publishBtn.trigger('click')
        await flushPromises()

        expect(axios.patch).toHaveBeenCalledWith('/api/v1/courses/teacher/1/edit/', {
            status: 'published'
        })
        expect(axios.get).toHaveBeenCalledTimes(2)
    })

    it('deletes a course after confirmation', async () => {
        axios.get.mockResolvedValueOnce({ data: coursesResponse })
        axios.delete.mockResolvedValueOnce({})

        const confirmSpy = vi.fn(() => true)
        vi.stubGlobal('confirm', confirmSpy)

        const wrapper = mountAdminCoursesTable('Admin')
        await flushPromises()

        const deleteCourseBtn = wrapper.findAll('button').find((button) => button.text() === 'Delete Course')
        await deleteCourseBtn.trigger('click')
        await flushPromises()

        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you wish to delete API Design? This action cannot be undone.')
        expect(axios.delete).toHaveBeenCalledWith('/api/v1/courses/teacher/1/delete/')
    })

    it('deletes a category after confirmation and reload coures', async () => {
        axios.get
            .mockResolvedValueOnce({ data: coursesResponse })
            .mockResolvedValueOnce({ data: [coursesResponse[1]] })
        
        axios.delete.mockResolvedValueOnce({})

        const confirmSpy = vi.fn(() => true)
        vi.stubGlobal('confirm', confirmSpy)

        const wrapper = mountAdminCoursesTable('Admin')
        await flushPromises()

        const deleteCategoryBtn = wrapper.findAll('button').find((button) => button.text() === 'Delete Category')
        await deleteCategoryBtn.trigger('click')
        await flushPromises()

        expect(axios.delete).toHaveBeenCalledWith('/api/v1/courses/admin/categories/delete/2/')
        expect(axios.get).toHaveBeenCalledTimes(2)
    })
})