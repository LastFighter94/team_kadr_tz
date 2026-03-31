import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0,
  },

  getters: {
    doubleCount: (state) => state.count * 2,
  },

  mutations: {
    INCREMENT(state) {
      state.count++
    },
  },

  actions: {
    increment({ commit }) {
      commit('INCREMENT')
    },
  },
})