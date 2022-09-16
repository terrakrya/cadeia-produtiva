<template>
  <div id="app">
    <div id="wrapper" class="bg-brown-1">
      <Navbar />
      <div v-if="currentUser">
        <b-row class="no-gutters">
          <b-col md="3" class="d-none d-md-block sidebar-wrapper">
            <Sidebar />
          </b-col>
          <b-col md="9" class="main bg-white">
            <div v-if="loading" class="my-5 text-center">
              <b-spinner variant="secondary" />
            </div>
            <div v-else>
              <Nuxt />
            </div>
          </b-col>
        </b-row>
      </div>
    </div>
    <notifications />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default {
  components: {
    Navbar,
    Sidebar,
  },

  middleware: 'auth',

  data() {
    return {
      loading: true,
    }
  },

  created() {
    this.loading = false
  },
}
</script>
