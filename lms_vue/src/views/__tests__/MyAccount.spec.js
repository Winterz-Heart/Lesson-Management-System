import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MyAccount from "../dashboard/MyAccount.vue";

let store

function mountMyAccount(role = 'student') {
    store = {
        state: {
            user: {
                role,
            }
        }
    }

    return mount(MyAccount, {
        global: {
            mocks: {
                $store: store
            },
            stubs: {
                RouterLink: {
                    template: '<a><slot/></a>',
                },
                RouterView: {
                    template: '<div class="router-view-stub" />',
                },
            },
        },
    })
}

describe('MyAccount.vue', () => {
    beforeEach(() => {
        document.title = ''
    })

    it('renders the account heading and navigation links for student role', () => {
        const wrapper = mountMyAccount()

        expect(wrapper.text()).toContain('My Account')
        expect(wrapper.text()).toContain('My Started Courses')
        expect(wrapper.text()).toContain('My Finished Courses')
        expect(wrapper.text()).not.toContain('Course Creator')
        expect(wrapper.text()).not.toContain('Draft Courses')
        expect(wrapper.text()).not.toContain('Published Courses')
    })

    it('renders the account heading and navigation links for teacher role', () => {
        const wrapper = mountMyAccount('teacher')

        expect(wrapper.text()).toContain('My Account')
        expect(wrapper.text()).toContain('Course Creator')
        expect(wrapper.text()).toContain('Draft Courses')
        expect(wrapper.text()).toContain('Published Courses')
        expect(wrapper.text()).not.toContain('My Started Courses')
        expect(wrapper.text()).not.toContain('My Finished Courses')
    })

    it('sets the document title on mount', () => {
        mountMyAccount()

        expect(document.title).toBe('My Account | LMS')
    })
})