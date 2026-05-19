import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import axios from 'axios'
import Login from '../Login.vue'

vi.mock('axios', () => ({
    default: {
        post: vi.fn(),
        defaults: {
            headers: {
                common: {}
            }
        }
    }
}))

describe('Login.vue', () => {
    let store
    let router

    beforeEach(() => {
        document.title = ''
        localStorage.clear()

        store = {
            commit: vi.fn(),
            dispatch: vi.fn().mockResolvedValue()
        }

        router = {
            push: vi.fn()
        }

        axios.post.mockReset()
        axios.defaults.headers.common = {}
    })

    function mountLogin() {
        return mount(Login, {
            global: {
                mocks: {
                    $store: store,
                    $router: router,
                },
                stubs: {
                    RouterLink: {
                        template: '<a><slot /></a>'
                    }
                }
            }
        })
    }

    it('renders the login heading and submit button', () => {
        const wrapper = mountLogin()

        expect(wrapper.text()).toContain('Login')
        expect(wrapper.find('button.button.is-dark').exists()).toBe(true)
    })

    it('sets document title on mount', () => {
        mountLogin()
        expect(document.title).toBe('Login | LMS')
    })

    it('shows errors when email and/or password are empty', async () => {
        const wrapper = mountLogin()

        await wrapper.find('form').trigger('submit.prevent')

        expect(wrapper.text()).toContain('You must input an Email address')
        expect(wrapper.text()).toContain('You must input a password')
        expect(axios.post).not.toHaveBeenCalled()
    })

    it('submits credentials, stores token and redirects on success', async () => {
        axios.post.mockResolvedValue({
            data: {
                auth_token: 'test-token'
            }
        })

        const wrapper = mountLogin()

        const inputs = wrapper.findAll('input.input')
        await inputs[0].setValue('test@example.com')
        await inputs[1].setValue('password123')

        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()

        expect(axios.post).toHaveBeenCalledWith('api/v1/token/login/', {
            username: 'test@example.com',
            password: 'password123',
        })

        expect(store.commit).toHaveBeenCalledWith('setToken', 'test-token')
        expect(store.dispatch).toHaveBeenCalledWith('fetchCurrentUser')
        expect(localStorage.getItem('token')).toBe('test-token')
        expect(axios.defaults.headers.common['Authorization']).toBe('Token test-token')
        expect(router.push).toHaveBeenCalledWith('/dashboard/my-account')
    })

    it('shows API validation errors when login fails', async () => {
        axios.post.mockRejectedValue({
            response: {
                data: {
                    non_field_errors: ['Unable to log in with provided credentials.']
                }
            }
        })

        const wrapper = mountLogin()

        const inputs = wrapper.findAll('input.input')
        await inputs[0].setValue('wrong@example.com')
        await inputs[1].setValue('wrongpassword')

        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()

        expect(wrapper.text()).toContain(
            'non_field_errors: Unable to log in with provided credentials.'
        )
    })
})