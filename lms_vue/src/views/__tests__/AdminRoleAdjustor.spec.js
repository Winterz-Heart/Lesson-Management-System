import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import AdminRoleAdjustor from "../dashboard/admin/AdminRoleAdjustor.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('AdminRoleAdjustor.vue', () => {
    function mockUsers() {
        return [
            {
                id: 1,
                first_name: 'Jane',
                last_name: 'Doe',
                email: 'jane@example.com',
                role: 'Student',
            },
            {
                id: 2,
                first_name: 'John',
                last_name: 'Smith',
                email: 'john@example.com',
                role: 'Teacher',
            },
        ];
    }

    function mountAdminRoleAdjustor(role = 'Admin') {
        return mount(AdminRoleAdjustor, {
            global: {
                mocks: {
                    $store: {
                        state: {
                            user: { role },
                        },
                    },
                },
            },
        });
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the role adjustment table for admins', async () => {
        axios.get.mockResolvedValueOnce({ data: mockUsers() });

        const wrapper = mountAdminRoleAdjustor('Admin');
        await flushPromises();

        expect(axios.get).toHaveBeenCalledWith(
            '/api/v1/courses/admin/users/roles/'
        );
        expect(wrapper.text()).toContain('Role Adjustment');
        expect(wrapper.text()).toContain('Jane Doe');
        expect(wrapper.text()).toContain('john@example.com');
        expect(wrapper.find('table').exists()).toBe(true);
        expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    });

    it('shows the permission message for non-admin users', async () => {
        axios.get.mockResolvedValueOnce({ data: mockUsers() });

        const wrapper = mountAdminRoleAdjustor('Student');
        await flushPromises();

        expect(wrapper.text()).toContain(
            'You don\'t have permission to adjust user roles'
        );
        expect(wrapper.find('table').exists()).toBe(false);
    });

    it('initializes pending roles from fetched users', async () => {
        axios.get.mockResolvedValueOnce({ data: mockUsers() });

        const wrapper = mountAdminRoleAdjustor('Admin');
        await flushPromises();

        expect(wrapper.vm.pendingRoles).toEqual({
            1: 'Student',
            2: 'Teacher',
        });
    });

    it('disables apply button when selected role matches current role', async () => {
        axios.get.mockResolvedValueOnce({ data: mockUsers() });

        const wrapper = mountAdminRoleAdjustor('Admin');
        await flushPromises();

        const buttons = wrapper.findAll('button.is-primary');
        expect(buttons[0].attributes('disabled')).toBeDefined();
        expect(buttons[1].attributes('disabled')).toBeDefined();
    });

    it('enables apply button when a new role is selected', async () => {
        axios.get.mockResolvedValueOnce({ data: mockUsers() });

        const wrapper = mountAdminRoleAdjustor('Admin');
        await flushPromises();

        const select = wrapper.findAll('select')[0];
        await select.setValue('Admin');

        const buttons = wrapper.findAll('button.is-primary');
        expect(buttons[0].attributes('disabled')).toBeUndefined();
    });

    it('submits a role change and refreshes the user list', async () => {
        axios.get
            .mockResolvedValueOnce({ data: mockUsers() })
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 1,
                        first_name: 'Jane',
                        last_name: 'Doe',
                        email: 'jane@example.com',
                        role: 'Admin',
                    },
                    {
                        id: 2,
                        first_name: 'John',
                        last_name: 'Smith',
                        email: 'john@example.com',
                        role: 'Teacher',
                    },
                ],
            });

        axios.patch.mockResolvedValueOnce({});

        const wrapper = mountAdminRoleAdjustor('Admin');
        await flushPromises();

        await wrapper.findAll('select')[0].setValue('Admin');
        await wrapper.findAll('button.is-primary')[0].trigger('click');
        await flushPromises();

        expect(axios.patch).toHaveBeenCalledWith(
            '/api/v1/courses/admin/users/roles/change-role/',
            {
                user_id: 1,
                new_role: 'Admin',
            }
        );
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.users[0].role).toBe('Admin');
    });

    it('restores the original pending role when the update fails', async () => {
        axios.get.mockResolvedValueOnce({ data: mockUsers() });
        axios.patch.mockRejectedValueOnce(new Error('Request failed'));

        const wrapper = mountAdminRoleAdjustor('Admin');
        await flushPromises();

        await wrapper.findAll('select')[0].setValue('Admin');
        await wrapper.findAll('button.is-primary')[0].trigger('click');
        await flushPromises();

        expect(wrapper.vm.pendingRoles[1]).toBe('Student');
    });

    it('returns the correct tag classes for each role', async () => {
        axios.get.mockResolvedValueOnce({ data: mockUsers() });

        const wrapper = mountAdminRoleAdjustor('Admin');
        await flushPromises();

        expect(wrapper.vm.roleTagClass('Admin')).toBe('is-danger');
        expect(wrapper.vm.roleTagClass('Teacher')).toBe('is-warning');
        expect(wrapper.vm.roleTagClass('Student')).toBe('is-info');
    });

    it('deletes a user and refreshes the user list after confirmation', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        axios.get
            .mockResolvedValueOnce({ data: mockUsers() })
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 2,
                        first_name: 'John',
                        last_name: 'Smith',
                        email: 'john@example.com',
                        role: 'Teacher',
                    },
                ],
            });

        axios.delete.mockResolvedValueOnce({});

        const wrapper = mountAdminRoleAdjustor('Admin');
        await flushPromises();

        await wrapper.findAll('button.is-danger')[0].trigger('click');
        await flushPromises();

        expect(confirmSpy).toHaveBeenCalledWith(
            'Are you sure you wish to delete Jane Doe? This action cannot be undone.'
        );
        expect(axios.delete).toHaveBeenCalledWith(
            '/api/v1/courses/admin/users/delete/1/'
        );
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.users).toHaveLength(1);
        expect(wrapper.vm.users[0].id).toBe(2);

        confirmSpy.mockRestore();
    });

    it('does not delete a user when confirmation is cancelled', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        axios.get.mockResolvedValueOnce({ data: mockUsers() });

        const wrapper = mountAdminRoleAdjustor('Admin');
        await flushPromises();

        await wrapper.findAll('button.is-danger')[0].trigger('click');
        await flushPromises();

        expect(confirmSpy).toHaveBeenCalled();
        expect(axios.delete).not.toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalledTimes(1);

        confirmSpy.mockRestore();
    });
});