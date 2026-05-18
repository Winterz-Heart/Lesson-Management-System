import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CourseCardViewer from "../CourseCardViewer.vue";

describe('CourseCardViewer.vue', () => {
    const catWeb = { id: 1, title: 'Web Development' };
    const catData = { id: 2, title: 'Data Science' };
    const catUnused = { id: 3, title: 'Unused' };

    const mockCourses = [
        { id: 1, title: "Vue Basics", categories: [catWeb] },
        { id: 2, title: "Django Basics", categories: [catWeb] },
        { id: 3, title: "Python 101", categories: [catData] },
        { id: 4, title: "React Basics", categories: [catWeb] },
        { id: 5, title: "Pandas", categories: [catData] },
        { id: 6, title: "Node.js", categories: [catWeb] },
        { id: 7, title: "GraphQL", categories: [catWeb] },
        { id: 8, title: "ML Intro", categories: [catData] },
    ];

    function mountViewer(props = {}) {
        return mount(CourseCardViewer, {
            props: {
                courses: mockCourses,
                categories: [catWeb, catData, catUnused],
                ...props, 
            },
            global: {
                stubs: {
                    CourseCard: {
                        name: 'CourseCard',
                        props: ['course'],
                        template: '<div class="course-card">{{ course.title }}</div>',
                    },
                },
            },
        });
    }

    it('renders All Categories as active on initial load', () => {
        const wrapper = mountViewer();
        const allCategoriesLink = wrapper.find('ul.menu-list li:first-child a');

        expect(allCategoriesLink.text()).toBe('All Categories');
        expect(allCategoriesLink.classes()).toContain('is-active');
    })

    it('derives visible categories from courses (hides Unused category)', () => {
        const wrapper = mountViewer();
        const categoryLinks = wrapper.findAll('ul.menu-list li a');

        const labels = categoryLinks.map((a) => a.text());
        expect(labels).toContain('All Categories')
        expect(labels).toContain('Web Development')
        expect(labels).toContain('Data Science')
        expect(labels).not.toContain('Unused')
    })

    it('renders first page with 6 courses', () => {
        const wrapper = mountViewer();
        const cards = wrapper.findAll('.course-card');

        expect(cards).toHaveLength(6);
        expect(wrapper.vm.currentPage).toBe(1)
        expect(wrapper.vm.totalPages).toBe(2)
    })

    it("goes to next page when Next is clicked", async () => {
    const wrapper = mountViewer();

    await wrapper.find("a.pagination-next").trigger("click");

    expect(wrapper.vm.currentPage).toBe(2);
    expect(wrapper.find("a.pagination-previous").classes()).not.toContain("is-disabled");
  });

    it("filters courses when category is selected and resets to page 1", async () => {
        const wrapper = mountViewer();

        await wrapper.find("a.pagination-next").trigger("click");
        expect(wrapper.vm.currentPage).toBe(2);

        const categoryLinks = wrapper.findAll("ul.menu-list li a");
        const dataScienceLink = categoryLinks.find((a) => a.text() === "Data Science");
        await dataScienceLink.trigger("click");

        expect(wrapper.vm.activeCategory).toEqual(catData);
        expect(wrapper.vm.currentPage).toBe(1);
        expect(wrapper.vm.filteredCourses.every((c) =>
        c.categories.some((cat) => cat.id === catData.id)
        )).toBe(true);
    });

    it("shows correct pagination size after filtering", async () => {
        const wrapper = mountViewer();

        const categoryLinks = wrapper.findAll("ul.menu-list li a");
        const dataScienceLink = categoryLinks.find((a) => a.text() === "Data Science");
        await dataScienceLink.trigger("click");

        expect(wrapper.vm.filteredCourses).toHaveLength(3);
        expect(wrapper.vm.totalPages).toBe(1);

        const pageLinks = wrapper.findAll("a.pagination-link");
        expect(pageLinks).toHaveLength(1);
        expect(pageLinks[0].text()).toBe("1");
    });
})

