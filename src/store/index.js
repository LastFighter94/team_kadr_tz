import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    applications: [],
    total: 0,
    loading: false,
    error: null,
  },

  getters: {
    applications: (state) => state.applications,
    total: (state) => state.total,
  },

  mutations: {
    SET_APPLICATIONS(state, applications) {
      state.applications = applications
    },
    SET_TOTAL(state, total) {
      state.total = total
    },
    SET_LOADING(state, value) {
      state.loading = value
    },
    SET_ERROR(state, message) {
      state.error = message
    },
    UPDATE_APPLICATION(state, updated) {
      const idx = state.applications.findIndex((a) => a.id === updated.id)
      if (idx !== -1) {
        Vue.set(state.applications, idx, updated)
      }
    },
  },

  actions: {
    async fetchApplications({ commit }, params = {}) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const response = await axios.get('http://localhost:3000/applications', { params })
        commit('SET_APPLICATIONS', response.data)
        commit('SET_TOTAL', parseInt(response.headers['x-total-count'] || 0))
      } catch {
        commit('SET_ERROR', 'Не удалось загрузить данные. Убедитесь, что json-server запущен.')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateApplication({ commit }, application) {
      const { data } = await axios.put(
        `http://localhost:3000/applications/${application.id}`,
        application
      )
      commit('UPDATE_APPLICATION', data)
    },
  },
})
