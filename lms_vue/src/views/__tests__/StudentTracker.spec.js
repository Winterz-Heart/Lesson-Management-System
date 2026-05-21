import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import axios from 'axios';
import StudentTracker from '../dashboard/StudentTracker.vue';

vi.mock('axios', () => ({
    default: {
        get: vi.fn()
    }
}))

describe('StudenTracker.vue', () => {
    function formatDate(value) {
        return new Date(value).toLocaleDateString()
    }

    function mountStudentTracker(role = 'Teacher') {
        return mount(StudentTracker, {
            global: {
                mocks: {
                    $store: {
                        state: {
                            user: {
                                role,
                            }
                        }
                    }
                }
            }
        })
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows a permission message for students', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });

        const wrapper = mountStudentTracker('Student');
        await flushPromises();

        expect(wrapper.text()).toContain("You don't have permisson to view student progress");
        expect(wrapper.find('table').exists()).toBe(false);
        expect(axios.get).toHaveBeenCalledWith('/api/v1/courses/teacher/student-progress-table/');
    });

    it('renders student progress rows for teachers', async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                {
                    id: 1,
                    first_name: 'Jane',
                    last_name: 'Doe',
                    courses_progress: [
                        {
                            id: 11,
                            course_title: 'Vue Basics',
                            status: 'started',
                            started_at: '2026-05-01T00:00:00Z',
                            completed_at: null,
                        },
                        {
                            id: 12,
                            course_title: 'Advanced Vue',
                            status: 'completed',
                            started_at: '2026-04-01T00:00:00Z',
                            completed_at: '2026-04-15T00:00:00Z',
                        },
                    ],
                },
            ],
        });

        const wrapper = mountStudentTracker('Teacher');
        await flushPromises();

        expect(wrapper.text()).toContain('Student Progress');
        expect(wrapper.text()).toContain('Jane Doe');
        expect(wrapper.text()).toContain('Vue Basics');
        expect(wrapper.text()).toContain('Advanced Vue');
        expect(wrapper.text()).toContain('started');
        expect(wrapper.text()).toContain('completed');
        expect(wrapper.text()).toContain(formatDate('2026-05-01T00:00:00Z'));
        expect(wrapper.text()).toContain(formatDate('2026-04-01T00:00:00Z'));
        expect(wrapper.text()).toContain(formatDate('2026-04-15T00:00:00Z'));
        expect(wrapper.find('.tag.is-warning').exists()).toBe(true);
        expect(wrapper.find('.tag.is-success').exists()).toBe(true);
    });

    it('renders the no courses enrolled row when a student has no progress records', async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                {
                    id: 2,
                    first_name: 'John',
                    last_name: 'Smith',
                    courses_progress: [],
                },
            ],
        });

        const wrapper = mountStudentTracker('Admin');
        await flushPromises();

        expect(wrapper.text()).toContain('John Smith');
        expect(wrapper.text()).toContain('No courses enrolled');
    });

    it('renders dashes for missing started and completed dates', async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                {
                    id: 3,
                    first_name: 'Alex',
                    last_name: 'Brown',
                    courses_progress: [
                        {
                            id: 21,
                            course_title: 'Django API',
                            status: 'started',
                            started_at: null,
                            completed_at: null,
                        },
                    ],
                },
            ],
        });

        const wrapper = mountStudentTracker('Teacher');
        await flushPromises();

        const cells = wrapper.findAll('tbody td').map((cell) => cell.text());
        expect(cells).toContain('-');
    });
})

