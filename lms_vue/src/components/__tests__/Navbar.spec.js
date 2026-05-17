import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createStore } from "vuex";
import { createRouter, createWebHistory } from "vue-router";
import Navbar from "../Navbar.vue";

// makes a new store for each test
function createTestStore(isAuthenticated = false) {
    return createStore({
        state: {
            user: { isAuthenticated }
        }
    })
}

// basic router for testing
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/about', component: { template: '<div />' } },
        { path: '/courses', component: { template: '<div />' } },
        { path: '/sign-up', component: { template: '<div />' } },
        { path: '/login', component: { template: '<div />' } },

    ]
})

describe('Navbar.vue', () => {
    it('renders the LMS brand link', () => {
        const wrapper = mount(Navbar,  {
            global: { plugins: [createTestStore(), router] }
        })

        expect(wrapper.text()).toContain('LMS')
    })

    it('shows Sign up and Login buttons when NOT authenticated', () => {
        const wrapper = mount(Navbar,  {
            global: { plugins: [createTestStore(false), router] }
        })

        expect(wrapper.text()).toContain('Sign up')
        expect(wrapper.text()).toContain('Login')
    })

    it('hides Sign up and Login buttons when authenticated, shows account button instead', () => {
        const wrapper = mount(Navbar,  {
            global: { plugins: [createTestStore(true), router] }
        })

        expect(wrapper.text()).not.toContain('Sign up')
        expect(wrapper.text()).not.toContain('Login')
        expect(wrapper.find('a.button.is-primary').exists()).toBe(true)
    })

    it('renders About and Course nav links', () => {
        const wrapper = mount(Navbar,  {
            global: { plugins: [createTestStore(), router] }
        })

        const links = wrapper.findAll('.navbar-start .navbar-item')
        const texts = links.map(l => l.text())
        expect(texts).toContain('About')
        expect(texts).toContain('Courses')
    })
})