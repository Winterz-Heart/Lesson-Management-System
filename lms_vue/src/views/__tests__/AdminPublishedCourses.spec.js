import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import AdminPublishedCourses from "../dashboard/admin/AdminPublishedCourses.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn()
    },
}))

describe('AdminPublishedCourses.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    function mountAdminPublishedCourses() {
        return mount(AdminPublishedCourses, {
            global: {
                stubs: {
                    CourseCardViewer: {
                        name: 'CourseCardViewer',
                        props: ['courses'],
                        template: '<div class="viewer-stub">Viewer {{ courses.length }}</div>',
                    },
                },
            },
        });
    }

    it("shows empty state when there are no drafted courses", async () => {
        axios.get.mockResolvedValue({
            data: [],
        });

        const wrapper = mountAdminPublishedCourses();
        await flushPromises();

        expect(axios.get).toHaveBeenCalledWith("/api/v1/courses/admin/published/");
        expect(wrapper.text()).toContain("No courses have been published yet");
        expect(wrapper.find(".viewer-stub").exists()).toBe(false);
    });

    it("renders CourseCardViewer when drafted courses exist", async () => {
        axios.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    slug: "vue-basics",
                    title: "Vue Basics",
                    short_description: "Intro to Vue",
                    categories: ["frontend"],
                },
                {
                    id: 2,
                    slug: "django-advanced",
                    title: "Django Advanced",
                    short_description: "Advanced Django topics",
                    categories: ["backend"],
                },
            ],
        });

        const wrapper = mountAdminPublishedCourses();
        await flushPromises();

        expect(wrapper.find(".viewer-stub").exists()).toBe(true);
        expect(wrapper.find(".viewer-stub").text()).toContain("Viewer 2");

        const viewer = wrapper.findComponent({ name: "CourseCardViewer" });
        expect(viewer.props("courses")).toEqual([
            {
                id: 1,
                slug: "vue-basics",
                title: "Vue Basics",
                short_description: "Intro to Vue",
                categories: ["frontend"],
            },
            {
                id: 2,
                slug: "django-advanced",
                title: "Django Advanced",
                short_description: "Advanced Django topics",
                categories: ["backend"],
            },
        ]);
    });
})