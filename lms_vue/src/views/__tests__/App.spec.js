import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import axios from "axios";
import App from "../../App.vue";

vi.mock('axios', () => ({
    default: {
        defaults: {
            headers: {
                common: {}
            }
        }
    }
}))

describe('App.vue', () => {
    function mountApp(token = '') {
        return mount(App, {
            global: {
                mocks: {
                    $store: {
                        state: {
                            user: {
                                token: token
                            }
                        },
                        commit: vi.fn(),
                        dispatch: vi.fn(),
                    }
                },
                stubs: {
                    Navbar: {
                        template: '<div class="navbar-stub" />'
                    },
                    RouterView: {
                        template: '<div class="router-view-stub" />'
                    },
                    Footer: {
                        template: '<div class="footer-stub" />'
                    },
                }
            }
        })
    }

    beforeEach(() => {
        axios.defaults.headers.common = {}
        vi.clearAllMocks()
    })

    it('renders the app components', () => {
        const wrapper = mountApp()

        expect(wrapper.find('.navbar-stub').exists()).toBe(true)
        expect(wrapper.find('.router-view-stub').exists()).toBe(true)
        expect(wrapper.find('.footer-stub').exists()).toBe(true)
    })

    it('initializes the store and clears authorization header when there is no token', () => {
        const wrapper = mountApp('')

        expect(wrapper.vm.$store.commit).toHaveBeenCalledWith('initializeStore')
        expect(wrapper.vm.$store.dispatch).not.toHaveBeenCalled()
        expect(axios.defaults.headers.common['Authorization']).toBe('')
    })

    it('initializes the store and fetch current user when token is set', () => {
        const wrapper = mountApp('test-token')

        expect(wrapper.vm.$store.commit).toHaveBeenCalledWith('initializeStore')
        expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith('fetchCurrentUser')
        expect(axios.defaults.headers.common['Authorization']).toBe('Token test-token')
    })
})