<template>
  <b-modal
    v-model="internalIsActive"
    title="Filtros"
    hide-footer
    centered
    size="lg"
    body-class="teste"
    @hidden="closeModal"
  >
    <div>
      <!-- Conteúdo dos filtros -->
      <div class="filter-buttons">
        <b-button
          id="show-btn"
          class="btn mb-2 mt-2"
          variant="panel"
          @click="applyFilter('safra')"
          >Safra</b-button
        >
        <b-button
          id="show-btn"
          class="btn mb-2 mt-2"
          variant="panel"
          @click="applyFilter('mes')"
          >Mes</b-button
        >
        <b-button
          id="show-btn"
          class="btn mb-2 mt-2"
          variant="panel"
          @click="applyFilter('quinzena')"
          >Quinzena</b-button
        >
        <b-button
          id="show-btn"
          class="btn mb-1 mt-2"
          variant="panel"
          @click="applyFilter('semana')"
          >Semana</b-button
        >
      </div>
    </div>
    <hr />
    <b-button class="mt-3" variant="secondary" @click="closeModal"
      >Cancelar</b-button
    >
  </b-modal>
</template>

<script>
export default {
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      internalIsActive: this.isActive,
    }
  },
  watch: {
    isActive(newVal) {
      this.internalIsActive = newVal
    },
  },
  methods: {
    closeModal() {
      this.$emit('update:isActive', false)
    },
    applyFilter(filter) {
      // Lógica para aplicar o filtro específico
      console.log('Aplicando filtro', filter)
      this.$emit('apply-filter', filter)
      this.closeModal()
    },
  },
}
</script>

<style>

.teste {
  background-color: #F9F9FB;
}

.filter-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.filter-buttons .b-button {
  width: 100%;
}
</style>
