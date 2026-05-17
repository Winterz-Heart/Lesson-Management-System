import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CourseCard from "../CourseCard.vue";

describe('CourseCard.vue', () => {
    const course = {
        title: 'Intro to Django',
        short_description: 'Learn models, views and serializers'
    }

    it('renders the course title and short description', () => {
        const wrapper = mount(CourseCard, {
            props: { course },
            global: {
                stubs: {
                    RouterLink: {
                        template: '<a><slot /><a>'
                    }
                }
            }
        })

        expect(wrapper.text()).toContain('Intro to Django')
        expect(wrapper.text()).toContain('Learn models, views and serializers')
    })

    it('renders the course link text', () => {
        const wrapper = mount(CourseCard, {
            props: { course },
            global: {
                stubs: {
                    RouterLink: {
                        template: '<a><slot /><a>'
                    }
                }
            }
        })

        expect(wrapper.text()).toContain('Course Link Here')
    })

    it('renders the placeholder image', () => {
        const wrapper = mount(CourseCard, {
            props: { course },
            global: {
                stubs: {
                    RouterLink: {
                        template: '<a><slot /><a>'
                    }
                }
            }
        })

        const img = wrapper.find('img')
        expect(img.exists()).toBe(true)
        expect(img.attributes('alt')).toBe('placeholder')
    })
})