<template>
  <div class="collections">
    <breadcrumb :active="title" />
    <div class="panel">
      <div class="panel-body">
        <MapOffline :default-marker="defaultMarker" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      title: 'Mapas',
      // defaultMarker: [{ location: { coordinates: [-21.9065, -47.8747] } }],
    }
  },
  computed: {
    defaultMarker() {
      if (!this.$route.query.lat || !this.$route.query.long) {
        return null
      }
      return {
        location: {
          coordinates: [this.$route.query.lat, this.$route.query.long],
        },
      }
    },
  },
  methods: {},
}
</script>
