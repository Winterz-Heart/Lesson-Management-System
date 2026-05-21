import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import axios from 'axios'
import SignUp from '../SignUp.vue'

vi.mock('axios', () => ({
    default: {
        post: vi.fn()
    }
}))

describe('SignUp.Vue', () => {
    let router

    beforeEach(() => {
        document.title = ''
        router = { push: vi.fn() }
        axios.post.mockReset()
    })

    function mountSignUp() {
        return mount(SignUp, {
            global: {
                mocks: {
                    $router: router
                },
                stubs: {
                    RouterLink: {
                        template: '<a><slot /></a>'
                    }
                }
            }
        })
    }

    it('renders title and submit button', () => {
        const wrapper = mountSignUp()

        expect(wrapper.text()).toContain('Sign Up')
        expect(wrapper.find('button.button.is-success').exists()).toBe(true)
    })

    it('renders title and submit button', () => {
        mountSignUp()

        expect(document.title).toBe('Sign Up | LMS')
    })

    it('shows validation erros when required fields are empty', async () => {
        const wrapper = mountSignUp()

        await wrapper.find('form').trigger('submit.prevent')

        expect(wrapper.text()).toContain('You must input an Email address')
        expect(wrapper.text()).toContain('You must input a First name')
        expect(wrapper.text()).toContain('You must input a Last name')
        expect(wrapper.text()).toContain('You must input a password')
        expect(wrapper.text()).toContain('You must repeat your password')
        expect(axios.post).not.toHaveBeenCalled()
    })

    it('shows password mismacth error', async () => {
        const wrapper = mountSignUp()
        const inputs = wrapper.findAll('input.input')

        await inputs[0].setValue('test@example.com') // username/email
        await inputs[1].setValue('Test') // first_name
        await inputs[2].setValue('User') // last_name
        await inputs[3].setValue('password123') // password
        await inputs[4].setValue('password999') // password2

        await wrapper.find('form').trigger('submit.prevent')

        expect(wrapper.text()).toContain('Your passwords must match')
        expect(axios.post).not.toHaveBeenCalled()
    })

    it('submits data and redirects to login on success', async () => {
        axios.post.mockResolvedValue({ data: {} })

        const wrapper = mountSignUp()
        const inputs = wrapper.findAll('input.input')

        await inputs[0].setValue('test@example.com') // username/email
        await inputs[1].setValue('Test') // first_name
        await inputs[2].setValue('User') // last_name
        await inputs[3].setValue('password123') // password
        await inputs[4].setValue('password123') // password2

        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()

        expect(axios.post).toHaveBeenCalled('/api/v1/users/', {
            username: 'test@example.com',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            password: 'password123'
        })

        expect(router.push).toHaveBeenCalledWith('/login')
    })

    it('shows API field errors when sign up fails', async () => {
        axios.post.mockRejectedValue({
            message: 'Request failed',
            response: {
                data: {
                    username: ['A user with that username already exists.']
                }
            }
        })

        const wrapper = mountSignUp()
        const inputs = wrapper.findAll('input.input')

        await inputs[0].setValue('test@example.com') // username/email
        await inputs[1].setValue('Test') // first_name
        await inputs[2].setValue('User') // last_name
        await inputs[3].setValue('password123') // password
        await inputs[4].setValue('password123') // password2

        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()

        expect(wrapper.text()).toContain('A user with that username already exists.')
    })
})