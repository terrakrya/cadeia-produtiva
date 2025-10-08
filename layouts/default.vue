<template>
  <div id="app">
    <div id="wrapper" class="bg-gray-1">
      <Navbar v-if="$auth.loggedIn" />
      <div>
        <b-row class="no-gutters">
          <b-col class="main bg-gray-1">
            <div v-if="loading" class="my-5 text-center">
              <b-spinner variant="secondary" />
            </div>
            <div v-else>
              <Nuxt />
            </div>
          </b-col>
        </b-row>
      </div>
      <BottomNavbar v-if="$auth.loggedIn" />
    </div>
    <notifications />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar'
import BottomNavbar from '@/components/BottomNavbar'

export default {
  components: {
    Navbar,
    BottomNavbar,
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
