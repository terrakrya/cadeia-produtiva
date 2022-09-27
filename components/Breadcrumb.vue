<template>
  <div>
    <ol class="breadcrumb">
      <li v-if="currentUser">
        <n-link
          to="/painel"
          active-class="breadcrumb-active"
          exact-active-class="breadcrumb-exact-active"
        >
          <b-icon-house-door-fill />
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
