import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Footer from "../Footer.vue";

describe('Footer.vue', () => {
    it('renders the footer with copyright text centered', () => {
        const wrapper = mount(Footer)

        expect(wrapper.find('footer.footer').exists()).toBe(true)

        const centeredText = wrapper.find('p.has-text-centered')
        expect(centeredText.exists()).toBe(true)
        expect(centeredText.text()).toContain('Copyright (C) 2026')
    })
})