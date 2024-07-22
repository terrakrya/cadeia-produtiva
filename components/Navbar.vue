<template>
  <b-navbar v-if="currentUser" :toggleable="true" type="dark" class="p-3">
    <div>
      <b-navbar-toggle v-show="true" target="sidebar" class="text-white">
        <span style="font-size: 30px"><b-icon-list class="text-white" /></span>
      </b-navbar-toggle>
      <b-navbar-brand class="text-white ml-2" to="/painel">IÊ</b-navbar-brand>
    </div>
    <b-link
      :to="`/cadastros/usuarios/${currentUser._id}/perfil`"
      class="btn-user"
    >
      <div class="btn-user-text">Olá, {{ currentUser.name.split(' ')[0] }}</div>
    </b-link>

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
      organization: null,
      roles: {
        admin: 'Administrador',
        gestor: 'Gestor',
        'gestor-global': 'Gestor Global',
        mensageiro: 'Mensageiro',
      },
    }
  },

  async created() {
    if (this.isManager || this.isMessenger) {
      this.organization = await this.$axios.$get(
        'organizations/' + this.currentUser.organization
      )
    }
  },
}
</script>
