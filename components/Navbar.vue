<template>
  <b-navbar v-if="currentUser" :toggleable="true" type="dark" class="p-3">
    <b-navbar-toggle v-visible="true" target="sidebar"></b-navbar-toggle>
    <b-navbar-nav class="ml-auto d-none d-md-flex">
      <b-nav-item-dropdown
        v-if="isManager || isMessenger"
        :text="currentUser.name + ' / ' + organization.sigla"
        right
      >
        <b-dropdown-item
          :to="'/cadastros/usuarios/' + currentUser._id + '/perfil'"
        >
          {{ 'Minha conta' }}
        </b-dropdown-item>
        <b-dropdown-item @click="$auth.logout()">Sair</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item-dropdown
        v-if="isAdmin || isGlobalManager"
        :text="currentUser.name"
        right
      >
        <b-dropdown-item
          :to="'/cadastros/usuarios/' + currentUser._id + '/perfil'"
        >
          {{ 'Minha conta' }}
        </b-dropdown-item>
        <b-dropdown-item @click="$auth.logout()">Sair</b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>
    <b-collapse id="sidebar" is-nav>
      <div>
        <Sidebar />
      </div>
    </b-collapse>
  </b-navbar>
</template>
<script>
import Sidebar from './Sidebar'
export default {
  components: {
    Sidebar,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      organization: [],
    }
  },

  async created() {
    this.organization = await this.$axios.$get(
      'organizations/' + this.currentUser.organization
    )
  },
}
</script>
