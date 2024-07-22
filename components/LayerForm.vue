<template>
  <span>
    <b-btn
      v-if="
        value &&
        (currentUser.role === 'admin' || currentUser._id === value.user)
      "
      class="btn btn-secondary"
      @click="open"
    >
      <b-icon-pencil />
    </b-btn>
    <b-btn v-if="!value" class="btn btn-primary text-white" @click="open">
      Adicionar camada
    </b-btn>
    <b-modal
      :id="'layer-form-modal-' + (value ? value._id : 'new')"
      :title="value ? 'Editar' : 'cadastrar' + ' camada'"
      hide-footer
      show
      style="z-index: 104900000"
    >
      <form ref="layer-form" @submit.prevent="save">
        <b-form-group label="Nome da camada">
          <b-form-input
            v-model="form.name"
            v-validate="'required'"
            required
            name="name"
          />
          <field-error :msg="veeErrors" field="name" />
        </b-form-group>
        <b-form-group label="Exibir esta camada por padrão">
          <b-form-checkbox v-model="form.show" class="d-inline">
            Visível por padrão no mapa
          </b-form-checkbox>
        </b-form-group>
        <div v-if="value">
          <div>
            <b-form-group label="Método de Integração">
              <b-form-radio-group v-model="form.integrationMethod">
                <b-form-radio value="upload">Upload</b-form-radio>
                <b-form-radio value="geoserver">GeoServer</b-form-radio>
              </b-form-radio-group>
            </b-form-group>
          </div>
          <div>
            <div v-if="form.integrationMethod == 'upload'">
              <b-form-group label="Cor do Layer">
                <LayerColor v-model="form.color" />
              </b-form-group>
              <Upload
                type="documents"
                btn-label="Enviar arquivo"
                label="Importar Arquivo"
                @input="isValidFileExtension"
              />
              <MapPreview :layer-name="form.layerName" />
              <b-alert variant="info" show>
                <strong>Permitido arquivos no seguinte formato:</strong>
                <p>Diretório de arquivos espaciais shapefiles (*.zip)</p>
              </b-alert>
              <b-alert v-if="!fileExtensionValid" show variant="danger">
                Extensão de arquivo inválida. Use .zip
              </b-alert>
            </div>
            <div v-if="form.integrationMethod == 'geoserver'">
              <b-form-group label="Nome do DataStore do Geoserver">
                <b-form-input v-model="form.dataStore" />
              </b-form-group>
              <b-form-group label="Nome do Layer do Geoserver">
                <b-form-input v-model="form.layerName" />
              </b-form-group>
              <b-form-group label="Cor do Layer">
                <LayerColor v-model="form.color" />
              </b-form-group>
              <MapPreview :layer-name="form.layerName" />
            </div>
          </div>
          <div v-if="geoJson" class="text-center">
            <loading :loading="importing" />
            <p>Confirme os dados que serão importados:</p>
            <div class="mb-3">
              <Map :geo-json="geoJson" />
            </div>
            <div v-if="!importing">
              <b-btn @click="geoJson = null">Cancelar</b-btn>
              <b-btn variant="success" @click="importGeoJson"
                >Confirmar importação</b-btn
              >
            </div>
          </div>
        </div>
        <div class="text-right mt-3">
          <b-btn @click="close">Cancelar</b-btn>
          <!-- eslint-disable -->
          <b-btn
            v-if="
              value &&
              (currentUser.role === 'admin' || currentUser.id === form.user_id)
            "
            @click="deleteLayer"
          >
            Excluir
          </b-btn>
          <b-btn
            v-if="
              value &&
              (form.integrationMethod === 'geoserver' ||
                form.integrationMethod == 'upload')
            "
            @click="downloadLayer"
          >
            Download
          </b-btn>
          <!-- eslint-enable -->
          <b-btn variant="success" type="submit">Salvar</b-btn>
        </div>
      </form>
    </b-modal>
  </span>
</template>

<script>
import axios from 'axios'
import { centroid } from '@turf/turf'

const defaultForm = {
  map: null,
  name: '',
  show: true,
  showCron: false,
  cronUrl: '',
  cronToken: '',
  cron: '',
  sourceFile: null,
  integrationMethod: null,
  dataStore: '',
  layerName: '',
  color: { label: 'Azul', value: 'blue' },
  user_id: null,
  create_user_rule: null,
  polygon: null,
}
export default {
  props: {
    value: {
      type: Object,
      default: () => {},
    },
    map: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      importing: false,
      show: false,
      geoJson: null,
      form: JSON.parse(JSON.stringify(defaultForm)),
      fileExtensionValid: true,
      showShare: false,
      // map
      center: [2.8198, -60.6715],
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      polygon: { latlngs: [] },
      mapTerritory: null,
    }
  },
  watch: {
    polygon(newValue) {
      this.$emit('input', newValue)
    },
  },
  mounted() {
    if (this.value) {
      this.polygon.latlngs = this.form.polygon
    }
    // Inicializar this.polygon se não estiver definido
    if (!this.polygon) {
      this.polygon = { latlngs: [] }
    }
  },
  created() {
    if (this.value) {
      Object.keys(this.form).forEach((k) => {
        if (this.value[k] !== undefined) {
          this.form[k] = JSON.parse(JSON.stringify(this.value[k]))
        }
      })
    }

    this.form.user_id = this.currentUser._id
    this.form.create_user_rule = this.currentUser.role
    this.form.map = this.map._id
  },
  methods: {
    open() {
      this.$bvModal.show(
        'layer-form-modal-' + (this.value ? this.value._id : 'new')
      )
    },
    close() {
      this.$bvModal.hide(
        'layer-form-modal-' + (this.value ? this.value._id : 'new')
      )
    },
    save() {
      this.$validator.validate().then(async (isValid) => {
        if (isValid) {
          this.loading = true

          // Envia o arquivo para o servidor Geo
          if (this.form.sourceFile) {
            const result = await this.$axios.post('geo/upload', {
              name: this.form.name,
              file: this.form.sourceFile,
            })
            this.form.dataStore = result.data.datastore
            this.form.layerName = result.data.layername
          }

          // Salva os dados do Layer
          this.savaData()
        }
      })
    },
    async savaData() {
      const resp = await this.$axios({
        method: this.value ? 'PUT' : 'POST',
        url: this.value ? 'maps/' + this.value._id + '/layer' : 'maps/layer',
        data: this.form,
      })
      this.loading = false

      const map = resp.data

      if (map) {
        this.notify('save_success')
        this.$emit('input', map)
        this.close()
      }
    },
    isValidFileExtension(file) {
      const allowedExtensions = ['zip']
      const fileExtension = file.url.split('.').pop()
      const result = allowedExtensions.includes(fileExtension.toLowerCase())
      this.fileExtensionValid = result
      this.form.sourceFile = file.url
      return result
    },
    async downloadLayer() {
      this.loading = true
      const response = await this.$axios({
        method: 'POST',
        url: 'geo/download',
        data: this.form,
      })
      window.open(response.data.url, '_blank')
      this.loading = false
    },
    sharedLayer() {
      this.showShare = true
    },
    async loadGeoJson(file) {
      const source = this.baseUrl + file.url
      const response = await axios.get(source)
      if (response && response.data) {
        if (response.data.type === 'FeatureCollection') {
          if (response.data.features && response.data.features.length) {
            this.geoJson = response.data
          } else {
            this.notify('no_item_to_import')
          }
        } else {
          this.notify('invalid_geojson')
        }
      }
    },
    async importGeoJson(file) {
      this.importing = true
      const map = await this.$axios.$post(
        'maps/' + this.value._id + '/layer-import-geojson',
        this.geoJson
      )
      this.geoJson = null
      this.notify('save_success')
      this.$emit('input', map)
      this.importing = false
      this.close()
    },
    deleteLayer() {
      this.$bvModal
        .msgBoxConfirm('Deseja excluir na base de dados essa camada?')
        .then((confirmed) => {
          if (confirmed) {
            this.delete()
          }
        })
    },
    async delete() {
      await this.$axios.$delete('maps/' + this.value._id + '/layer')
      window.location.reload()
    },
  },
}
</script>
<style>
.custom-radio {
  width: 160px !important;
}
.modal-dialog {
  max-width: 90% !important;
  width: 90% !important;
}
</style>
