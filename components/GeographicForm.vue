<template>
  <div class="product">
    <Breadcrumb
      :links="[['Cadastro', '/cadastros/areas-geograficas']]"
      active="Áreas geográficas"
    />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Áreas geográficas" />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <b-col sm="4">
              <b-form-group label="Estado">
                <b-form-select
                  v-model="form.uf"
                  v-validate="'required'"
                  class="form-control"
                  :options="estados"
                  name="uf"
                  value-field="codigo_uf"
                  text-field="nome"
                  @input="loadCities()"
                />
                <field-error :msg="veeErrors" field="uf" />
              </b-form-group>
            </b-col>
            <b-col sm="4">
              <b-form-group label="Município">
                <b-form-select
                  v-model="form.county"
                  class="form-control"
                  :options="cidades"
                  value-field="nome"
                  text-field="nome"
                  @input="loadPracas()"
                />
              </b-form-group>
            </b-col>
            <b-col sm="4">
              <b-form-group label="Região imediata">
                <input
                  v-model="form.square"
                  type="text"
                  readonly
                  class="form-control"
                  text-field="nome"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <b-col sm="5">
              <b-form-group label="Nome">
                <input
                  class="form-control"
                  type="text"
                  placeholder="Nome da área"
                />
                <field-error :msg="veeErrors" field="uf" />
              </b-form-group>
            </b-col>
            <Upload
              v-model="form.file"
              type="documents"
              label="Coordenadas"
              edit-title
            />
            <b-col sm="12">
              <b-form-group label="Comentários">
                <b-form-textarea v-model="form.comments" />
              </b-form-group>
            </b-col>
          </div>
          <div>
            <l-map
              style="height: 500px"
              :zoom="zoom"
              :center="center"
              @click="onMapClick"
            >
              <l-tile-layer
                :url="url"
                :attribution="attribution"
              ></l-tile-layer>
              <l-marker
                :lat-lng="markerLatLng"
                @click="removeMarker"
              ></l-marker>
              <l-polygon
                :lat-lngs="polygon"
                :options="polygonOptions"
              ></l-polygon>
            </l-map>
          </div>
          <br />
          <form-submit :sending="is_sending" />
        </b-form>
      </div>
    </div>
  </div>
</template>
<script>
import { LMap, LTileLayer, LMarker, LPolygon } from 'vue2-leaflet'
import Breadcrumb from '@/components/Breadcrumb'
import estados from '@/data/estados.json'
import cidades from '@/data/municipios.json'
import pracas from '@/data/praca.json'
import 'leaflet/dist/leaflet.css'
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
      cidades,
      pracas,
      form: {
        uf: '',
        county: '',
        square: '',
        squareid: '',
        selctPraca: '',
        polygon: [],
        name: '',
        comments: '',
        file: null,
      },
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
  created() {
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }
    this.loadCities()
    this.loadPracas()
  },
  methods: {
    onMapClick(e) {
      this.markerLatLng = [e.latlng.lat, e.latlng.lng] // Atualiza as coordenadas do marcador
      const { lat, lng } = e.latlng
      this.polygon.push([lat, lng])
    },
    removeMarker() {
      this.markerLatLng = [0, 0]
    },
    loadCities() {
      // lista de cidades com somente o item "selecione a município"
      // this.cidades = [{ value: '', nome: 'Selecione a município' }]

      // filtra as cidades conforme a UF selecionada
      if (this.form.uf) {
        this.cidades = this.cidades.filter((item) => {
          return item.codigo_uf === this.form.uf
        })
      }

      // limpa a município digitada, caso não exista na lista
      if (this.form.county && this.cidades) {
        if (!this.cidades.find((c) => c === this.form.county)) {
          this.form.county = ''
        }
      }
    },

    // filtra as regioes imediatas conforme a município selecionada
    loadPracas() {
      if (this.form.county) {
        const cidade = this.form.county
        const pracas = this.pracas.filter(function (item) {
          return item.cidade === cidade
        })
        if (pracas && pracas.length > 0) {
          this.form.square = pracas[0].nome
          this.form.squareid = pracas[0].id
        }
      }
    },
    edit(id) {
      this.is_loading = true
      this.$axios
        .get('geographic-areas/' + id)
        .then((response) => {
          this.apiDataToForm(this.form, response.data)
          this.polygon = response.data.polygon
          this.form.square = response.data.square
          this.is_loading = false
        })
        .catch(this.showError)
    },
    save() {
      this.$validator.validate().then((isValid) => {
        // valida a code
        if (isValid) {
          this.is_sending = true

          this.form.polygon.push(this.polygon)

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'geographic-areas/' + this.$route.params.id
              : 'geographic-areas',
            data: this.form,
          })
            .then((resp) => {
              const product = resp.data
              if (product && product._id) {
                this.notify('Áreas geográficas salvo com sucesso')
                this.$router.replace('/cadastros/areas-geograficas')
              }
              this.is_sending = false
            })
            .catch(this.showError)
        }
      })
    },
  },
}
</script>
