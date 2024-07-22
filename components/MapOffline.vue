<template>
  <div class="map">
    <div class="map-settings" :style="'top:200px;left:10px'">
      <div v-if="!showOptionsBox">
        <b-icon-tools @click="toggleOptionsBox" />
      </div>
      <div v-else>
        <div
          class="d-flex flex-row align-items-center justify-content-between"
          @click="toggleOptionsBox"
        >
          <h4>Opções</h4>
          <div>
            <b-icon-tools />
            <b-icon-chevron-up />
          </div>
        </div>

        <p>Nivel do zoom: {{ currentZoom }}</p>
        <h2>Camadas</h2>
        <div class="mb-2">
          <LayerForm :map="map" @input="updateMap" />
        </div>
        <!--Camadas cadastradas pelo Usuario-->
        <div v-if="map" class="mt-3">
          <strong>Camadas:</strong>
          <div v-for="layer in map.layers" :key="layer._id" class="mb-2">
            <b-form-checkbox
              v-model="layer.show"
              :value="true"
              class="d-inline"
              :unchecked-value="false"
            >
              {{ layer.name }}
            </b-form-checkbox>
            <LayerForm :value="layer" :map="map" @input="updateMap" />
          </div>
        </div>
      </div>
    </div>
    <l-map :zoom="currentZoom" :center="center" style="height: 100vh">
      <l-tile-layer :url="url" :attribution="attribution" />

      <!-- layer territorio -->
      <!-- eslint-disable -->
      <template v-for="(territory, index) in mapElements.territories">
        <l-geo-json
          v-if="territory.polygon && territory.show"
          :key="territory.name + '-' + index"
          :geojson="territory.polygon"
          :options="getLayerColor('green')"
        />
      </template>
      <!-- eslint-endable -->

      <!-- areas de atuacoes da brigada -->
      <template v-for="area in mapElements.areaActivity">
        <l-polygon v-if="area.show" :key="area.id" :lat-lngs="area.polygon">
          <l-popup :lat-lng="area.polygon">
            <p>{{ area.name }}</p>
          </l-popup>
        </l-polygon>
      </template>

      <!-- layers cadastrado pelo usuario -->
      <div v-if="map">
        <template v-for="layer in map.layers">
          <!-- eslint-disable -->
          <template
            v-if="
              (layer.integrationMethod === 'geoserver' ||
                layer.integrationMethod === 'upload') &&
              layer.show
            "
          >
            <l-wms-tile-layer
              :key="layer.layerName"
              :base-url="wmsLayer.url"
              :layers="wmsLayer.workspace + ':' + layer.layerName"
              :visible="layer.show"
              :name="wmsLayer.name"
              :transparent="true"
              format="image/png"
              layer-type="base"
            >
            </l-wms-tile-layer>
          </template>
          <template v-if="layer.integrationMethod === 'draw' && layer.show">
            <l-polygon
              :lat-lngs="layer.polygon"
              :color="layer.color.value"
              :fillColor="layer.color.value"
            >
              <l-popup :lat-lng="layer.polygon">
                <p>{{ layer.name }}</p>
              </l-popup>
            </l-polygon>
          </template>
          <!-- eslint-enable -->
        </template>
      </div>
    </l-map>
  </div>
</template>

<script>
import { centroid } from '@turf/turf'
import { LMap, LPopup, LTileLayer, LWMSTileLayer } from 'vue2-leaflet'
export default {
  components: {
    LMap,
    LPopup,
    LTileLayer,
    'l-wms-tile-layer': LWMSTileLayer,
  },
  props: {
    defaultMarker: {
      type: Array,
      default: () => [],
    },
    link: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // Mapa
      currentZoom: 8,
      center: [-14.132, -47.514],
      attribution:
        '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      wmsLayer: {
        url: 'https://geo.terrakrya.com/geoserver/Ie_BETA/wms',
        workspace: 'Ie_BETA',
        visible: true,
        format: 'image/png',
        transparent: true,
      },
      map: null,
      mapElements: {
        alerts: false,
        fires: true,
        rois: false,
        extraMapInfo: false,
        downloadedAreas: false,
        territories: false,
        areaActivity: false,
      },
      tmp: false,
      // Componentes
      showOptionsBox: false,
      showFiltersBox: false,
      showInfoBox: false,
    }
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      // Busca os layer cadastrados no sistema
      await this.getLayers()
    },
    async getLayers() {
      this.map = await this.$axios.$get('maps')
      this.map = this.map[0]
    },
    async getTerritories() {
      // Se o usuario esteja vinculado a um territorio
      // Busca os dados desse territorio
      if (this.currentUser.network && this.currentUser.network.layerName) {
        await this.$axios
          .$get('/geo/layer/' + this.currentUser.network.layerName)
          .then((mapTerritory) => {
            this.mapElements.territories = [
              {
                id: this.currentUser.network._id,
                name: this.currentUser.network.name,
                polygon: mapTerritory,
                show: true,
              },
            ]
            // Seta o centro do mapa baseado no territorio
            const center = centroid(this.mapElements.territories[0].polygon)
            if (center) {
              this.center = [
                center.geometry.coordinates[1],
                center.geometry.coordinates[0],
              ]
            }
          })
      } else {
        this.getAllTerritories()
      }
    },
    async getAllTerritories() {
      // Busca todos os territorios
      // Entra aqui se for super user
      this.currentZoom = 5
      const territories = await this.$axios.$get('networks')
      this.tmp = territories
      this.mapElements.territories = []
      this.mapElements.areaActivity = []
      // Percorro todos os territorios
      for (const territory of territories) {
        // Busco o dado de cada territorio no geoserver
        await this.$axios
          .$get('/geo/layer/' + territory.layerName)
          .then((polygon) => {
            this.mapElements.territories.push({
              id: territories._id,
              name: territory.name,
              polygon: polygon.features ? polygon : false,
              show: true,
            })
          })
        // Populo os grupos/area de atuacao de cada territorio
        for (const group of territory.groups) {
          if (group.areaactivity && group.areaactivity.length > 0) {
            this.mapElements.areaActivity.push({
              id: group._id,
              name: group.name,
              polygon: group.areaactivity,
              show: true,
              address: group.address,
            })
          }
        }
      }
    },
    async getGroup() {
      // Busca o layer de uma brigada
      if (this.currentUser.group && this.currentUser.group.layername) {
        this.mapElements.areaActivity = [
          {
            id: this.currentUser.group._id,
            name: this.currentUser.group.name,
            polygon: this.currentUser.group.areaactivity,
            show: true,
            address: this.currentUser.group.address,
          },
        ]
      } else if (this.currentUser.role !== 'super') {
        // Busca as areas de atuacao de um gestor
        const groups = await this.$axios.$get('groups')
        this.mapElements.areaActivity = []
        for (const group of groups) {
          if (group.areaactivity && group.areaactivity.length > 0) {
            this.mapElements.areaActivity.push({
              id: group._id,
              name: group.name,
              polygon: group.areaactivity,
              show: true,
              address: group.address,
            })
          }
        }
      }
    },
    getLayerColor(c) {
      return {
        style: {
          color: c,
          fillColor: c,
          fillOpacity: 0.2,
        },
      }
    },
    toggleOptionsBox() {
      this.showOptionsBox = !this.showOptionsBox
      this.showFiltersBox = false
      this.showInfoBox = false
    },
    updateMap(map) {
      this.load()
    },
  },
}
</script>
<style>
.savetiles {
  display: none;
}
.map-settings {
  max-width: 380px;
  position: absolute;
  left: 10px;
  top: 220px;
  background-color: white;
  z-index: 999;
  padding: 10px;
  margin: 20px;
  border: 2px solid #c2bfbb;
  border-radius: 4px;
}
</style>
