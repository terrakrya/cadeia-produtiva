<template>
  <div class="product">
    <breadcrumb active="Cadastro de Áreas geográficas" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Áreas geográficas</h1>
          </div>
          <div v-if="!isManager" class="col-sm-6 main-actions">
            <n-link
              to="/cadastros/areas-geograficas/cadastrar"
              class="btn btn-primary"
            >
              <b-icon-plus /> {{ 'Cadastrar' }}
            </n-link>
          </div>
        </div>
        <br />
        <div>
          <l-map style="height: 500px" :zoom="zoom" :center="center">
            <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
            <l-marker :lat-lng="markerLatLng" @click="removeMarker"></l-marker>
            <l-polygon
              :lat-lngs="polygon"
              :options="polygonOptions"
            ></l-polygon>
          </l-map>
        </div>
        <br />
        <div class="info-content">
          <div class="text-right">
            <input
              v-model="filters.search"
              type="search"
              :placeholder="'Buscar'"
              class="form-control search-input"
            />
          </div>
          <br />
          <no-item :list="geographic" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="geographic"
            :sort-by="'code'"
            :filter="filters.search"
          >
            <template #cell(uf)="data">
              {{ data.item.uf }}
            </template>
            <template #cell(county)="data">
              {{ data.item.county }}
            </template>
            <template #cell(square)="data">
              {{ data.item.square }}
            </template>
            <template #cell(actions)="data">
              <n-link
                :to="
                  '/cadastros/areas-geograficas/' + data.item._id + '/editar'
                "
                class="btn btn-secondary"
              >
                <b-icon-pencil />
              </n-link>
              <a class="btn btn-secondary" @click="remove(data.item._id)">
                <b-icon-trash />
              </a>
            </template>
          </b-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPolygon } from 'vue2-leaflet'
import Breadcrumb from '@/components/Breadcrumb'
import 'leaflet/dist/leaflet.css'
import estados from '@/data/estados.json'
export default {
  components: {
    Breadcrumb,
    LMap,
    LTileLayer,
    LMarker,
    LPolygon,
  },
  data() {
    return {
      estados,
      filters: { search: null },
      table_fields: [
        {
          key: 'uf',
          label: 'Estado',
          sortable: true,
        },
        {
          key: 'county',
          label: 'Municipio',
          sortable: true,
        },
        {
          key: 'square',
          label: 'Praça',
          sortable: true,
        },
      ],
      geographic: null,
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      zoom: 4,
      center: [-10.850958, -51.492461],
      polygon: [],
      polygonOptions: { color: 'blue' },
      markerLatLng: [0, 0],
    }
  },

  async created() {
    await this.list()
    const actions = {
      key: 'actions',
      label: 'Ação',
      class: 'actions',
    }
    if (!this.isManager) {
      this.table_fields.push(actions)
    }
  },
  methods: {
    async list() {
      this.geographic = await this.$axios.$get('geographic-areas')
      this.geographic.uf = this.estados.filter((item) => {
        return item.codigo_uf === this.geographic.uf
      })
    },
    onMapClick(e) {
      this.markerLatLng = [e.latlng.lat, e.latlng.lng] // Atualiza as coordenadas do marcador
      const { lat, lng } = e.latlng
      this.polygon.push([lat, lng])
    },
    removeMarker() {
      this.markerLatLng = [0, 0]
    },

    remove(id) {
      this.$bvModal
        .msgBoxConfirm('Tem certeza que deseja excluír?')
        .then((confirmed) => {
          if (confirmed) {
            this.$axios
              .$delete('geographic-areas/' + id)
              .then(() => {
                this.list()
              })
              .catch(this.showError)
          }
        })
    },
  },
}
</script>
