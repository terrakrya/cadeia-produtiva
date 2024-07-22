<template>
  <div
    v-if="list && list.length === 0"
    class="no-item text-center alert alert-dark"
  >
    {{ msg ? msg : 'Nenhum item encontrado' }}
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => null,
    },
    msg: {
      type: String,
      default: '',
    },
  },
}
</script>
