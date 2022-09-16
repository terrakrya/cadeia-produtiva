<template>
  <button v-if="loading" type="button" class="alert alert-default w-100">
    <b-spinner small />
    {{ msg || 'Carregando' }}...
  </button>
</template>
<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    msg: {
      type: String,
      default: '',
    },
  },
}
</script>
