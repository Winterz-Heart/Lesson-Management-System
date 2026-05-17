import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import About from '../About.vue'

describe('About.vue', () => {
  beforeEach(() => {
    document.title = ''
  })

  it('renders the about heading and description', () => {
    const wrapper = mount(About)

    expect(wrapper.text()).toContain('About')
    expect(wrapper.text()).toContain(
      'This my attempt at making a Lesson Management System, using a Django based backend to store all of its data'
    )
  })

  it('sets the document title on mount', () => {
    mount(About)

    expect(document.title).toBe('About | LMS')
  })
})