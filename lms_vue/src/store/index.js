import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    user: {
      token: '',
      isAuthenticated: false,
    }
  },
  getters: {
  },
  mutations: {
    initializeStore(state) {
      if (localStorage.getItem('token')) {
        state.user.token = localStorage.getItem('token')
        state.user.isAuthenticated = true
        axios.defaults.headers.common['Authorization'] = `Token ${state.user.token}`
      } else {
        state.user.token = ''
        state.user.isAuthenticated = flase
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
  },
  actions: {
  },
  modules: {
  }
})
