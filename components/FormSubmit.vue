<template>
  <div class="row">
    <div class="col-sm-12 text-center">
      <b-alert
        v-if="hasErrors"
        variant="danger"
        show
      >Verifique os requisitos acima antes de continuar</b-alert>
      <button
        role="button"
        class="btn btn-lg rounded-pill"
        :class="{
          'floating-button': floating,
          'btn-secondary': floating,
          'btn-primary': !floating,
          'btn-block': !floating,
        }"
      >
        <div v-if="sending"><b-spinner small /> Enviando dados...</div>
        <div v-else>{{ 'Salvar' }}</div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormSubmit',
  props: {
    sending: {
      type: Boolean,
      default: false,
    },
    floating: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    hasErrors() {
      const errs = this.veeErrors && this.veeErrors.items;
      if (!errs) return false;
      return errs.some(err => !err.scope);
    },
  },
}
</script>
