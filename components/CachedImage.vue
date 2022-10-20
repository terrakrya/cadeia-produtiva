<template>
  <b-img
    v-if="url"
    :src="url"
    :fluid="fluid"
    :class="cssClass"
    :width="width"
    :rounded="thumb"
  />
</template>

<script>
import CryptoJS from 'crypto-js'
import axios from 'axios'
export default {
  props: {
    value: {
      type: Object,
      default: () => null,
    },
    thumb: {
      type: Boolean,
      default: false,
    },
    fluid: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: null,
    },
    cssClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      url: null,
    }
  },
  created() {
    if (this.value && this.value.url) {
      const tryThumb = this.thumb && this.value.thumb
      try {
        this.loadUrl(
          this.baseUrl + (tryThumb ? this.value.thumb : this.value.url)
        )
      } catch (error) {
        this.loadUrl(this.baseUrl + this.value.url)
      }
    }
  },
  methods: {
    async loadUrl(url) {
      const hash = CryptoJS.MD5(url).toString()
      const cached = await this.getLocalItem(hash)
      if (cached) {
        this.url = URL.createObjectURL(cached)
      } else {
        this.url = url
        try {
          await this.cacheUrl(this.url)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('Unable to cache: ' + this.url)
        }
      }
    },
    async cacheUrl(url) {
      const fileToCache = await axios.get(url, {
        responseType: 'blob',
      })
      const hash = CryptoJS.MD5(url).toString()
      await this.setLocalItem(hash, fileToCache.data)
      this.url = URL.createObjectURL(fileToCache.data)
    },
  },
}
</script>
