<template>
  <div v-if="!isOnline" class="offline-indicator">
    <span>
      <font-awesome-icon icon="wifi-slash" /> Você está offline
    </span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOnline: true
    }
  },
  mounted() {
    if (process.client) {
      this.isOnline = navigator.onLine
      window.addEventListener('online', this.updateOnlineStatus)
      window.addEventListener('offline', this.updateOnlineStatus)
    }
  },
  beforeDestroy() {
    if (process.client) {
      window.removeEventListener('online', this.updateOnlineStatus)
      window.removeEventListener('offline', this.updateOnlineStatus)
    }
  },
  methods: {
    updateOnlineStatus() {
      this.isOnline = navigator.onLine
      if (this.isOnline) {
        this.$syncOfflineData()
      }
    }
  }
}
</script>

<style>
.offline-indicator {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  background-color: #dc3545;
  color: white;
  text-align: center;
  padding: 8px;
  z-index: 999;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
}
</style> 