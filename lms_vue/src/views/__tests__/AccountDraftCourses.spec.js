import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import AccountDraftCourses from "../dashboard/AccountDraftCourses.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn()
    },
}))

describe('AccountDraftCourses.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    function mountAccountDraftCourses() {
        return mount(AccountDraftCourses, {
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

        const wrapper = mountAccountDraftCourses();
        await flushPromises();

        expect(axios.get).toHaveBeenCalledWith("/api/v1/courses/teacher/my_drafts/");
        expect(wrapper.text()).toContain("You haven't drafted any courses yet");
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

        const wrapper = mountAccountDraftCourses();
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