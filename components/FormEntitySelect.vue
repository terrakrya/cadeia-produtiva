<template>
  <div>
    <v-select
      v-model="entity"
      v-validate="validate"
      :options="list"
      label="title"
      name="formEntitySelect"
      :placeholder="placeholder || 'Busque pelo nome e clique para selecionar'"
      @input="selected"
    >
      <template #option="option">
        <div class="select-item">
          <img v-if="option.picture" :src="baseUrl + option.picture" />
          <div class="desc">
            <strong>{{ option.title }}</strong>
            <br />
            <small>{{ option.description }}</small>
          </div>
          <div class="clearfix"></div>
        </div>
      </template>
      <template #selected-option="option">
        <div class="select-item">
          <img v-if="option.picture" :src="baseUrl + option.picture" />
          <div class="desc">
            <strong>{{ option.title }}</strong>
            <br />
            <small>{{ option.description }}</small>
          </div>
          <div class="clearfix"></div>
        </div>
      </template>
    </v-select>
    <span v-for="(err, index) in veeErrors" :key="index">
      <span v-if="err.field === 'formEntitySelect'" class="text-danger">{{
        err.msg
      }}</span>
    </span>
  </div>
</template>

<script>
import vSelect from 'vue-select'

export default {
  name: 'FormEntitySelect',
  components: {
    vSelect,
  },
  inject: ['$validator'],
  props: {
    items: {
      type: Array,
      default: () => null,
    },
    type: {
      type: String,
      default: null,
    },
    value: {
      type: String,
      default: () => null,
    },
    validate: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: null,
    },
    filter: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      list: [],
      entity: null,
    }
  },
  watch: {
    items(newVal) {
      this.list = newVal
    },
    value(newVal) {
      if (newVal && newVal) {
        this.entity = this.list.find((item) => {
          return item.id === newVal
        })
      } else {
        this.entity = null
      }
    },
  },
  async created() {
    if (this.items) {
      this.list = [...this.items].sort(function (a, b) {
        return a.title.localeCompare(b.title)
      })
    } else {
      const filterItem = this.filter ? { filters: this.filter } : null

      switch (this.type) {
        case 'species':
          this.list = (await this.$axios.$get('species', filterItem))
            .map((specie) => ({
              id: specie._id,
              title: specie.scientificName,
              description: specie.localNames,
              picture:
                specie.images && specie.images.length
                  ? specie.images[0].thumb
                  : '',
            }))
            .sort(function (a, b) {
              return a.title.localeCompare(b.title)
            })

          break
        case 'speciesProducts':
          this.list = (await this.$axios.$get('species-products', filterItem))
            .map((specie) => ({
              id: specie._id,
              title: specie.name,
              description: specie.description,
              picture:
                specie.images && specie.images.length
                  ? specie.images[0].thumb
                  : '',
            }))
            .sort(function (a, b) {
              return a.title.localeCompare(b.title)
            })

          break
        case 'organizations':
          this.list = (await this.$axios.$get('organizations', filterItem))
            .map((organization) => ({
              id: organization._id,
              title: organization.name,
              description: organization.cnpj,
            }))
            .sort(function (a, b) {
              return a.title.localeCompare(b.title)
            })

          break
      }
    }

    if (this.value && this.value) {
      this.entity = this.list.find((item) => {
        return item.id === this.value
      })
    }
  },
  methods: {
    selected() {
      if (this.entity) {
        this.$emit('input', this.entity.id)
      } else {
        this.$emit('input', null)
      }
      this.$emit('selected', this.entity)
    },
  },
}
</script>
