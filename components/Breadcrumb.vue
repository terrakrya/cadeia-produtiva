<template>
  <div>
    <div v-if="$nuxt.isOffline" class="bg-secondary text-center text-white p-2">
      Trabalhando em modo offline
    </div>
    <ol class="breadcrumb">
      <li v-if="currentUser">
        <n-link
          to="/painel"
          active-class="breadcrumb-active"
          exact-active-class="breadcrumb-exact-active"
        >
          <b-icon-house-door-fill />
          <span v-if="currentUser.role !== 'collector' && currentUser.network">
            &nbsp;{{ currentUser.network.name }}
          </span>
        </n-link>
      </li>
      <li v-for="(link, index) in links" :key="index">
        <n-link :to="link[1]">{{ link[0] }}</n-link>
      </li>
      <li class="active">{{ active }}</li>
    </ol>
  </div>
</template>

<script>
export default {
  name: 'Breadcrumb',
  props: {
    links: {
      type: Array,
      default: () => null,
    },
    active: {
      type: String,
      default: '',
    },
  },
}
</script>
