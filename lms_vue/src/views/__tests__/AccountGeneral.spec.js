import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import AccountGeneral from "../dashboard/AccountGeneral.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        defaults: {
            headers: {
                common: {},
            }
        }
    }
}));

describe('AccountGeneral.vue', () => {
    let store;
    let router;

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();

        store = {
            commit: vi.fn(),
        };

        router = {
            push: vi.fn(),
        };

        axios.defaults.headers.common = {};
    })

    function mountAccountGeneral() {
        return mount(AccountGeneral, {
            global: {
                mocks: {
                    $store: store,
                    $router: router,
                },
            },
        });
    }

    it('shows loading text before user details are fetched', () => {
        axios.get.mockReturnValue(new Promise(() => {}));
        const wrapper = mountAccountGeneral();

        expect(wrapper.text()).toContain('Loading account details...');
    })

    it('fetches curretn user on mount and renders user data', async () => {
        axios.get.mockResolvedValue({
            data: {
                username: 'jdoe',
                first_name: 'John',
                last_name: 'Doe',
            },
        });

        const wrapper = mountAccountGeneral();
        await flushPromises();

        expect(axios.get).toHaveBeenCalledWith('api/v1/users/me');
        expect(wrapper.text()).toContain('Username:');
        expect(wrapper.text()).toContain('jdoe');
        expect(wrapper.text()).toContain('First name:');
        expect(wrapper.text()).toContain('John');
        expect(wrapper.text()).toContain('Last name:');
        expect(wrapper.text()).toContain('Doe');
    })
    
    it('logs out user and redirects to home', async () => {
        axios.get.mockResolvedValue({
            data: {
                username: 'jdoe',
                first_name: 'John',
                last_name: 'Doe',
            },
        });
        axios.post.mockResolvedValue({});

        localStorage.setItem('token', 'abc123')
        axios.defaults.headers.common['Authorization'] = 'Token abc123';

        const wrapper = mountAccountGeneral();
        await flushPromises();

        await wrapper.find('button.button.is-danger').trigger('click');
        await flushPromises();

        expect(axios.post).toHaveBeenCalledWith('/token/logout');
        expect(axios.defaults.headers.common['Authorization']).toBe('');
        expect(localStorage.getItem('token')).toBeNull();
        expect(store.commit).toHaveBeenCalledWith('removeToken');
        expect(router.push).toHaveBeenCalledWith('/');
    })

    it('does not crash if user fetch fails', async () => {
        axios.get.mockRejectedValue(new Error('Network error'));

        const wrapper = mountAccountGeneral();
        await flushPromises();

        expect(wrapper.text()).toContain('Loading account details...');
    })
})