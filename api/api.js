let $axios

export function setAxios(axios) {
  $axios = axios
}

const list = async function (url, params) {
  return await $axios.$get(url, { params })
}

const loadList = async function (type, params) {
  return await list(type, params)
}

export default {
  loadList,
  list,
}
