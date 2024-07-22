const initialState = {}
export const state = () => initialState

export const mutations = {
  set(state, data) {
    state[data.type] = JSON.parse(JSON.stringify(data.items))
  },
  updateList(state, data) {
    const list = JSON.parse(JSON.stringify(state[data.type]))
    list[data.item._id] = data.item
    state[data.type] = list
  },
}
