<template>
  <div>
    <div class="text-right input-group">
      <input
        v-model="searchInput"
        type="search"
        :placeholder="'Buscar'"
        class="form-control search-input"
        aria-label="Search Price Information"
      />
    </div>
    <br />
    <no-item :list="priceInformations" />
    <b-table
      class="table b-table b-table-stacked-md table-striped"
      :fields="tableFields"
      :items="priceInformations"
      :sort-by="defaultSortBy"
      :sort-desc="defaultSortDesc"
      :filter="debouncedFilter"
      stacked="lg"
    >
      <template #cell(product)="data">
        {{ data.item.product.name }}
      </template>
      <template #cell(createdAt)="data">
        {{ formatDate(data.item.createdAt) }}
      </template>
      <template #cell(buyerPosition)="data">
        Preço de {{ data.item.buyerPositionSeller }} para
        {{ data.item.buyerPositionBuyer }}
      </template>
      <template #cell(messenger)="data">
        {{ data.item.messenger.name }}
      </template>
      <template #cell(organization)="data">
        <span v-if="data.item.organization">
          {{ data.item.organization.sigla }}
        </span>
      </template>
      <template #cell(uf)="data">
        {{ data.item.uf }}
      </template>
      <template #cell(city)="data">
        {{ data.item.city }}
      </template>
      <template #cell(square)="data">
        {{ data.item.square }}
      </template>
      <template #cell(minimumPrice)="data">
        {{ data.item.originalMinimumPrice | moeda }}
        <small
          v-if="data.item.measure !== 'Kg'"
          class="text-muted"
          style="font-size: 11px"
          @click="$bvModal.show('bv-modal')"
        >
          <br />
          {{ data.item.minimumPrice | moeda }}/Kg
        </small>
      </template>
      <template #cell(maximumPrice)="data">
        {{ data.item.originalMaximumPrice | moeda }}
        <small
          v-if="data.item.measure !== 'Kg'"
          class="text-muted"
          style="font-size: 11px"
          @click="$bvModal.show('bv-modal')"
        >
          <br />
          {{ data.item.maximumPrice | moeda }}/Kg
        </small>
      </template>
      <template #cell(totalTransactionValue)="data">
        {{ data.item.totalTransactionValue | moeda }}
      </template>
      <template #cell(transactedQuantity)="data">
        {{ data.item.transactedQuantity }}
      </template>
      <template #cell(measure)="data">
        {{ data.item.measure }}
      </template>
      <template #cell(actions)="data">
        <n-link
          :to="'/operacional/informacao-preco/' + data.item._id + '/editar'"
          class="btn btn-secondary"
        >
          <b-icon-pencil />
        </n-link>
        <a class="btn btn-secondary" @click="handleRemove(data.item._id)">
          <b-icon-trash />
        </a>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: 'PriceInformationTable',
  props: {
    priceInformations: {
      type: Array,
      required: true,
    },
    tableFields: {
      type: Array,
      required: true,
    },
    defaultSortBy: {
      type: String,
      default: 'createdAt',
    },
    defaultSortDesc: {
      type: Boolean,
      default: true,
    },
    searchPlaceholder: {
      type: String,
      default: 'Buscar',
    },
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      searchInput: this.value,
      debouncedFilter: this.value,
      debounceTimer: null,
    }
  },
  watch: {
    value(newVal) {
      this.searchInput = newVal
    },
    searchInput(newVal) {
      clearTimeout(this.debounceTimer)

      this.debounceTimer = setTimeout(() => {
        this.debouncedFilter = newVal
        this.$emit('input', newVal)
      }, 300)
    },
  },
  methods: {
    handleRemove(id) {
      this.$emit('remove', id)
    },
    formatDate(date) {
      return this.$moment(date).format('DD/MM/YYYY')
    },
  },
  beforeDestroy() {
    clearTimeout(this.debounceTimer)
  },
}
</script>
