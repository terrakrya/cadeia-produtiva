<template>
  <div>
    <b-list-group class="sidebar color-white">
      <b-list-group-item>
        <b-nav>
          <b-nav-item class="text-white" to="/painel"> Início </b-nav-item>
        </b-nav>
      </b-list-group-item>
      <b-list-group-item v-if="isAdmin || isGlobalManager || isManager">
        <b-nav v-if="isAdmin || isGlobalManager">
          <b-nav-item class="text-white" to="/cadastros/especies"
            >Espécies</b-nav-item
          >
        </b-nav>
        <b-nav v-if="isAdmin || isGlobalManager">
          <b-nav-item class="text-white" to="/cadastros/especies-produtos">
            Classificações de espécies/produtos
          </b-nav-item>
        </b-nav>
        <b-nav v-if="isAdmin || isGlobalManager">
          <b-nav-item class="text-white" to="/cadastros/tipos">
            Tipos de boas práticas e certificação
          </b-nav-item>
        </b-nav>
        <b-nav v-if="isAdmin || isGlobalManager">
          <b-nav-item class="text-white" to="/cadastros/produtos"
            >Produtos</b-nav-item
          >
        </b-nav>
        <b-nav v-if="isAdmin || isGlobalManager || isManager">
          <b-nav-item class="text-white" to="/cadastros/organizacoes"
            >Organizações</b-nav-item
          >
        </b-nav>
        <b-nav v-if="isAdmin || isGlobalManager || isManager">
          <b-nav-item class="text-white" to="/cadastros/usuarios"
            >Usuários</b-nav-item
          >
        </b-nav>
        <b-nav v-if="isAdmin || isGlobalManager || isManager">
          <b-nav-item class="text-white" to="/cadastros/areas-geograficas"
            >Áreas geográficas</b-nav-item
          >
        </b-nav>
      </b-list-group-item>
      <b-list-group-item>
        <b-nav>
          <b-nav-item class="text-white" to="/operacional/informacao-preco">
            Histórico de Preços Informados
          </b-nav-item>
        </b-nav>
      </b-list-group-item>
      <b-list-group-item>
        <b-nav>
          <b-nav-item class="text-white" to="/dados-publicados">
            Dados publicados
          </b-nav-item>
        </b-nav>
      </b-list-group-item>
      <b-list-group-item>
        <b-nav>
          <b-nav-item
            class="text-white"
            :to="'/cadastros/usuarios/' + currentUser._id + '/perfil'"
          >
            Minha conta
          </b-nav-item>
        </b-nav>
      </b-list-group-item>

      <b-list-group-item>
        <b-nav>
          <b-nav-item class="text-white" @click="$auth.logout()"
            >Sair</b-nav-item
          >
        </b-nav>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>
