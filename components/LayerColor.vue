<template>
  <div>
    <v-select
      v-model="selectedColor"
      :options="colors"
      dense
      outlined
      @input="updateColor"
    ></v-select>
  </div>
</template>

<script>
import vSelect from 'vue-select'

export default {
  components: {
    vSelect,
  },
  props: {
    value: {
      type: Object,
      default: () => ({ label: 'Azul', value: 'blue' }),
    },
  },
  data() {
    return {
      selectedColor: this.value || { label: 'Selecione', value: '' },
      colors: [
        { label: 'Vermelho', value: 'red' },
        { label: 'Azul', value: 'blue' },
        { label: 'Verde', value: 'green' },
        { label: 'Amarelo', value: 'yellow' },
        { label: 'Laranja', value: 'orange' },
        { label: 'Roxo', value: 'purple' },
        { label: 'Rosa', value: 'pink' },
        { label: 'Preto', value: 'black' },
        { label: 'Branco', value: 'white' },
        { label: 'Cinza', value: 'gray' },
      ],
    }
  },
  methods: {
    updateColor(newValue) {
      this.$emit('input', newValue)
    },
  },
}
</script>
