<template>
  <div>
    <b-form-group :label="label" :description="description">
      <div v-if="showPreview && !avatar && preview && preview.length">
        <table
          class="table b-table mb-1"
          :class="{
            'b-table-stacked-md': editTitle || editDescription || editLink,
          }"
        >
          <tbody>
            <tr v-for="(item, index) in preview" :key="index">
              <td style="width: 100px" class="pl-0">
                <CachedAudio v-if="type === 'audios'" :value="item" />
                <CachedImage
                  v-else-if="type === 'images'"
                  :value="item"
                  thumb
                  width="100"
                />
                <CachedDocument v-else :value="item" />
              </td>
              <td v-if="editTitle || editDescription || editLink">
                <b-form-input
                  v-if="editTitle"
                  v-model="item.title"
                  placeholder="Título"
                  class="mt-1"
                />
                <b-form-textarea
                  v-if="editDescription"
                  v-model="item.description"
                  placeholder="Descrição"
                  class="mt-1"
                />
                <b-form-input
                  v-if="editLink"
                  v-model="item.link"
                  placeholder="Link"
                  class="mt-1"
                />
                <b-form-input
                  v-if="editLink"
                  v-model="item.link_title"
                  placeholder="Título do link"
                  class="mt-1"
                />
              </td>
              <td v-if="editDescription" />
              <td class="text-right pr-0">
                <b-btn variant="danger" @click="deleteFile(index)">
                  <b-icon-trash />
                </b-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <b-button v-if="is_loading" variant="secondary" disabled>
        <b-spinner small />
        Enviando arquivos...
      </b-button>
      <div v-if="type === 'audios'">
        <RecordAudio @result="uploadFiles" />
        <b-btn variant="success" @click="upload">
          <b-icon-upload />
          {{ buttonLabel }}
        </b-btn>
      </div>
      <a v-else-if="avatar" @click="upload">
        <b-avatar
          size="6rem"
          :src="
            preview && preview[0] && preview[0].thumb
              ? baseUrl + preview[0].thumb
              : null
          "
        >
          <template #badge>
            <b-icon-camera />
          </template>
        </b-avatar>
      </a>
      <b-btn v-else variant="success" @click="upload">
        <b-icon-upload />
        {{ buttonLabel }}
      </b-btn>
      <input
        v-show="false"
        :ref="'uploads-input-' + inputId"
        :multiple="multiple"
        :accept="accept"
        type="file"
        @change="uploadFiles"
      />
    </b-form-group>
  </div>
</template>

<script>
import CryptoJS from 'crypto-js'
export default {
  props: {
    value: {
      type: [Object, Array],
      default: () => null,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: 'Arquivos',
    },
    description: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      required: true,
    },
    showPreview: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: Boolean,
      default: false,
    },
    editTitle: {
      type: Boolean,
      default: false,
    },
    editDescription: {
      type: Boolean,
      default: false,
    },
    editLink: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      is_loading: false,
    }
  },
  computed: {
    buttonLabel() {
      const plural = this.multiple ? 's' : ''
      switch (this.type) {
        case 'images':
          return 'Enviar imagem' + plural
        case 'documents':
          return 'Enviar documento' + plural
        case 'audios':
          return 'Enviar áudio' + plural
      }
      return 'Enviar arquivo' + plural
    },
    inputId() {
      return Math.random().toString(36).substring(2, 15)
    },
    accept() {
      if (this.type === 'audios') {
        return 'audio/*'
      } else if (this.type === 'images') {
        return 'image/*'
      }
      return null
    },
    preview() {
      if (Array.isArray(this.value)) {
        return this.value
      } else if (this.value && this.value.url) {
        return [this.value]
      }
      return []
    },
  },
  methods: {
    async uploadFiles(e) {
      this.is_loading = true
      let files = []
      if (e.target) {
        files = e.target.files || e.dataTransfer.files
      } else {
        files.push(e)
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const filename =
          Date.now() + '-' + (file.name || this.currentUser.id + '-audio.webm')
        const url = 'api/uploads/' + this.type + '/' + filename
        const hash = CryptoJS.MD5(this.baseUrl + url).toString()

        await this.setLocalItem(hash, file)

        const formData = new FormData()
        formData.append('file', file, filename)

        this.$axios
          .$post('/uploads/' + this.type, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((uploaded) => {
            this.callback(uploaded)
          })
          .catch((error) => {
            this.showError(error)
          })
      }
    },
    callback(uploaded) {
      if (this.multiple) {
        let ret = [uploaded]
        if (this.value) {
          ret = this.value.concat(uploaded)
        }
        this.$emit('input', ret)
      } else {
        this.$emit('input', uploaded)
      }
      this.$emit('uploaded', uploaded)
      this.is_loading = false
    },
    deleteFile(index) {
      if (this.multiple) {
        this.$emit(
          'input',
          this.value.filter((item, i) => i !== index)
        )
      } else {
        this.$emit('input', null)
      }
    },
    upload() {
      // eslint-disable-next-line dot-notation
      this.$refs['uploads-input-' + this.inputId].click()
    },
  },
}
</script>
