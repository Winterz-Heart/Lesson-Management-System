import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import AdminStudentTracker from "../dashboard/admin/AdminStudentTracker.vue";

vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("AdminStudentTracker.vue", () => {
    function formatDate(value) {
        return new Date(value).toLocaleDateString();
    }

    function mockInitialRequests({
        students = [],
        courses = [],
    } = {}) {
        axios.get
            .mockResolvedValueOnce({ data: students })
            .mockResolvedValueOnce({ data: courses });
    }

    function mountAdminStudentTracker(role = "Admin") {
        return mount(AdminStudentTracker, {
            global: {
                mocks: {
                    $store: {
                        state: {
                            user: { role },
                        },
                    },
                },
            },
        });
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders student progress rows for admins", async () => {
        mockInitialRequests({
            students: [
                {
                    id: 1,
                    first_name: "Jane",
                    last_name: "Doe",
                    courses_progress: [
                        {
                            id: 11,
                            course_title: "Vue Basics",
                            status: "started",
                            started_at: "2026-05-01T00:00:00Z",
                            completed_at: null,
                        },
                        {
                            id: 12,
                            course_title: "Advanced Vue",
                            status: "completed",
                            started_at: "2026-04-01T00:00:00Z",
                            completed_at: "2026-04-15T00:00:00Z",
                        },
                    ],
                },
            ],
            courses: [
                { id: 101, title: "Vue Basics", category: "Frontend" },
                { id: 102, title: "Advanced Vue", category: "Frontend" },
            ],
        });

        const wrapper = mountAdminStudentTracker("Admin");
        await flushPromises();

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(axios.get).toHaveBeenNthCalledWith(
            1,
            "/api/v1/courses/teacher/student-progress-table/"
        );
        expect(axios.get).toHaveBeenNthCalledWith(
            2,
            "/api/v1/courses/?status=published"
        );

        expect(wrapper.text()).toContain("Adjust Student Progress");
        expect(wrapper.text()).toContain("Jane Doe");
        expect(wrapper.text()).toContain("Vue Basics");
        expect(wrapper.text()).toContain("Advanced Vue");
        expect(wrapper.text()).toContain("started");
        expect(wrapper.text()).toContain("completed");
        expect(wrapper.text()).toContain(formatDate("2026-05-01T00:00:00Z"));
        expect(wrapper.text()).toContain(formatDate("2026-04-01T00:00:00Z"));
        expect(wrapper.text()).toContain(formatDate("2026-04-15T00:00:00Z"));
        expect(wrapper.text()).toContain("-");

        expect(wrapper.find(".tag.is-warning").exists()).toBe(true);
        expect(wrapper.find(".tag.is-success").exists()).toBe(true);
        expect(wrapper.findAll("tbody tr")).toHaveLength(2);
    });

    it("renders empty enrollment state for students with no courses", async () => {
        mockInitialRequests({
            students: [
                {
                    id: 1,
                    first_name: "Jane",
                    last_name: "Doe",
                    courses_progress: [],
                },
            ],
            courses: [],
        });

        const wrapper = mountAdminStudentTracker("Admin");
        await flushPromises();

        expect(wrapper.text()).toContain("Jane Doe");
        expect(wrapper.text()).toContain("No courses enrolled");
    });

    it("shows the permission message for non-admin users", async () => {
        mockInitialRequests({
            students: [],
            courses: [],
        });

        const wrapper = mountAdminStudentTracker("Student");
        await flushPromises();

        expect(wrapper.text()).toContain(
            "You don't have permisson to adjust student progress"
        );
        expect(wrapper.find("table").exists()).toBe(false);
    });

    it("shows validation error when adding without selecting both fields", async () => {
        mockInitialRequests({
            students: [{ id: 1, first_name: "Jane", last_name: "Doe", courses_progress: [] }],
            courses: [{ id: 101, title: "Vue Basics", category: "Frontend" }],
        });

        const wrapper = mountAdminStudentTracker("Admin");
        await flushPromises();

        await wrapper.find("button.is-success").trigger("click");

        expect(axios.post).not.toHaveBeenCalled();
        expect(wrapper.text()).toContain(
            "Both Student and Course must be selected to add"
        );
    });
});