import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MyAccount from "../dashboard/MyAccount.vue";

function mountMyAccount() {
    return mount(MyAccount, {
        global: {
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

    it('renders the account heading and navigation links', () => {
        const wrapper = mountMyAccount()

        expect(wrapper.text()).toContain('My Account')
        expect(wrapper.text()).toContain('My Started Courses')
        expect(wrapper.text()).toContain('My Finished Courses')
    })

    it('sets the document title on mount', () => {
        mountMyAccount()

        expect(document.title).toBe('My Account | LMS')
    })
})