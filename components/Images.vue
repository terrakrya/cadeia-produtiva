<template>
  <div v-if="images && images.length > 0" class="images mt-4">
    <dl>
      <dt>{{ label }}</dt>
      <dd>
        <b-row>
          <b-col v-for="image in images" :key="image._id" md="3">
            <CachedImage :value="image" thumb />
          </b-col>
        </b-row>
      </dd>
    </dl>
  </div>
</template>

<script>
import CachedImage from '@/components/CachedImage'
export default {
  components: {
    CachedImage,
  },
  props: {
    images: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: 'Fotos',
    },
  },
}
</script>
