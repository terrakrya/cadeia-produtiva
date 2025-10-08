<template>
  <div class="bottom-navbar" v-if="!isMap && $auth.loggedIn">
    <b-button variant="bottom" to="/painel" class="nav-button">
      <div class="button-content">
        <font-awesome-icon icon="fa-solid fa-equals" class="nav-icon" />
        <span class="nav-text">Início</span>
      </div>
    </b-button>
    <b-button
      variant="bottom"
      to="/operacional/informacao-preco/cadastrar"
      class="nav-button"
    >
      <div class="button-content">
        <font-awesome-icon icon="fa-solid fa-pager" class="nav-icon" />
        <span class="nav-text">Preços</span>
      </div>
    </b-button>
  </div>
</template>

<script>
export default {
  name: 'BottomNavbar',
  computed: {
    isMap() {
      return this.$route.name == 'mapa'
    },
  },
}
</script>