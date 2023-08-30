<template>
  <b-navbar v-if="currentUser" :toggleable="true" type="dark" class="p-3">
    <b-navbar-toggle v-show="true" target="sidebar" class="text-white">
      <span style="font-size: 30px"><b-icon-list class="text-white" /></span>
    </b-navbar-toggle>
    <div>
      <div class="d-flex justify-content-end align-items-center text-white">
        <small>
          <strong>
            <b-icon-person-fill class="mr-2" />
            {{ currentUser.name.split(' ')[0] }}
          </strong>
        </small>
      </div>
      <div class="text-white">
        <small>{{ roles[currentUser.role] || currentUser.role }}</small>
        <small v-if="organization"> - {{ organization.sigla }}</small>
      </div>
    </div>
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
