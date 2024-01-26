<template>
  <div id="app">
    <div id="wrapper" class="bg-brown-1">
      <Navbar />
      <div>
        <b-row class="no-gutters">
          <b-col class="main bg-white" style="border-radius: 6px">
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

export default {
  components: {
    Navbar,
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
