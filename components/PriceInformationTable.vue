<template>
  <div>
    <div class="text-right">
      <input
        v-model="internalFilter"
        type="search"
        :placeholder="searchPlaceholder"
        class="form-control search-input"
      />
    </div>
    <br />
    <no-item :list="priceInformations" />
    <b-table
      class="table b-table b-table-stacked-md table-striped"
      :fields="tableFields"
      :items="priceInformations"
      :sort-by="defaultSortBy"
      :filter="internalFilter"
      stacked="lg"
    >
      <template #cell(product)="data">
        {{ data.item.product.name }}
      </template>
      <template #cell(createdAt)="data">
        {{ data.item.createdAt | moment('DD/MM/YYYY') }}
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
      required: true
    },
    tableFields: {
      type: Array,
      required: true
    },
    defaultSortBy: {
      type: String,
      default: 'product'
    },
    searchPlaceholder: {
      type: String,
      default: 'Buscar'
    },
    value: { // for v-model support on the search input
      type: String,
      default: ''
    }
  },
  data() {
    return {
      internalFilter: this.value
    };
  },
  watch: {
    value(newVal) {
      this.internalFilter = newVal;
    },
    internalFilter(newVal) {
      this.$emit('input', newVal);
    }
  },
  methods: {
    handleRemove(id) {
      this.$emit('remove', id);
    }
  }
};
</script> 