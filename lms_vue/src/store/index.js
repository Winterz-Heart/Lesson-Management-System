import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    user: {
      token: '',
      isAuthenticated: false,
      role: 'user',
      groups: []
    }
  },
  getters: {
    userRole: state => state.user.role,
    userGroups: state => state.user.groups,
    hasRole: state => role => state.user.role === role
  },
  mutations: {
    initializeStore(state) {
      if (localStorage.getItem('token')) {
        state.user.token = localStorage.getItem('token')
        state.user.isAuthenticated = true
        axios.defaults.headers.common['Authorization'] = `Token ${state.user.token}`
      } else {
        state.user.token = ''
        state.user.isAuthenticated = false
      }
    },
    setToken(state, token) {
      state.user.token = token
      state.user.isAuthenticated = true
      axios.defaults.headers.common['Authorization'] = `Token ${token}`
    },
    removeToken(state, token) {
      state.user.token = token
      state.user.isAuthenticated = false
    },
    setCurrentUser(state, payload) {
      state.user.role = payload?.role
      state.user.groups = payload?.groups
    },
    clearCurrentUser(state) {
      state.user.role = 'user'
      state.user.groups = []
    }
  },
  actions: {
    async fetchCurrentUser({ commit, state }) {
      if (!state.user.isAuthenticated) return
      const { data } = await axios.get('/api/v1/users/me')
      commit('setCurrentUser', data)
    }
  },
  modules: {
  }
})
