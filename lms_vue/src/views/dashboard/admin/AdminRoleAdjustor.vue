<template>
    <div class="admin-role-adjustment">
        <h2 class="title is-4">Role Adjustment</h2>

        <template v-if="fetchUserRole === 'Admin'">
            <div class="subtitle mb-4 mt-4">
                Select a new role and click apply
            </div>

            <table class="table is-fullwidth is-hoverable is-striped">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>Change Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                        v-for="user in users"
                        :key="user.id"
                    >
                        <td>{{ user.first_name }} {{ user.last_name }}</td>
                        <td>{{ user.email }}</td>

                        <td>
                            <span
                                class="tag"
                                :class="roleTagClass(user.role)"
                            >
                                {{ user.role }}
                            </span>
                        </td>

                        <td>
                            <div class="select is-small">
                                <select v-model="pendingRoles[user.id]">
                                    <option disabled value="">Select role</option>
                                    <option
                                        v-for="role in roles"
                                        :key="role"
                                        :value="role"
                                    >
                                        {{ role }}
                                    </option>
                                </select>
                            </div>
                        </td>

                        <td>
                            <button
                                class="button is-small is-primary"
                                :disabled="!pendingRoles[user.id] || pendingRoles[user.id] === user.role"
                                @click="applyRoleChange(user)"
                            >
                                Apply
                            </button>
                            <button
                                class="button is-small is-danger ml-8"
                                @click="deleteUser(user)"
                            >
                                Delete User
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>
        
        <template v-else>
            <p>You don't have permission to adjust user roles</p>
        </template>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            roles: ['Student', 'Teacher', 'Admin'],
            users: [],
            pendingRoles: {},
        }
    },
    computed: {
        fetchUserRole() {
            return this.$store.state.user.role
        }
    },
    async mounted() {
        this.getUsersAndRoles()
    },
    methods: {
        roleTagClass(role) {
            if (role === 'Admin') return'is-danger'
            if (role === 'Teacher') return 'is-warning'
            return 'is-info'
        },
        applyRoleChange(user) {
            const newRole = this.pendingRoles[user.id]

            if (!newRole || newRole === user.role) return

            axios
                .patch('/api/v1/courses/admin/users/roles/change-role/', {
                    user_id: user.id,
                    new_role: newRole,
                })
                .then(() => {
                    user.role = newRole
                    this.getUsersAndRoles()
                })
                .catch((error) => {
                    console.log(error)
                    this.pendingRoles[user.id] = user.role
                })
        },
        async getUsersAndRoles() {
            await axios
                .get('/api/v1/courses/admin/users/roles/')
                .then(response => {
                    this.users = response.data

                    this.pendingRoles = {}
                    this.users.forEach(user => {
                        this.pendingRoles[user.id] = user.role || ''
                    })
                })
                .catch((error) => {
                    console.log(error)
                })
        },
        async deleteUser(user) {
            const confirmed = window.confirm(
                `Are you sure you wish to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`
            )

            if (!confirmed) return
            
            await axios
                .delete(`/api/v1/courses/admin/users/delete/${user.id}/`)
                .then(() => {
                    this.getUsersAndRoles()
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }
}
</script>