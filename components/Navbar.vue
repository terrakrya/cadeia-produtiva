<template>
  <b-navbar v-if="currentUser" toggleable="md" type="dark" class="p-3">

    <b-collapse id="sidebar" is-nav>
      <div class="d-md-none">
        <Sidebar />
      </div>
    </b-collapse>
    <b-navbar-nav class="ml-auto d-none d-md-flex">
      <b-nav-item-dropdown :text="currentUser.name" right>
        <b-dropdown-item
          :to="'/cadastros/usuarios/' + currentUser._id + '/perfil'"
        >
          {{ 'Minha conta' }}
        </b-dropdown-item>
        <b-dropdown-item @click="$auth.logout()">Sair</b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>
    <b-navbar-toggle target="sidebar"></b-navbar-toggle>
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
}
</script>
