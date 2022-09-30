<template>
  <div>
    <b-list-group class="sidebar color-white">
      <b-list-group-item>
        <i class="fas fa-tools" />
        Cadastros
        <b-icon-chevron-down />
      </b-list-group-item>
      <b-list-group-item class="bg-brown-2">
        <b-nav vertical>
          <b-nav-item to="/usuarios">Usuários</b-nav-item>
        </b-nav>
        <b-nav vertical>
          <b-nav-item to="/produtos">Produtos</b-nav-item>
        </b-nav>
        <b-nav vertical>
          <b-nav-item to="/categorias">Categorias</b-nav-item>
        </b-nav>
      </b-list-group-item>
      <b-list-group-item>
        <b-icon-person /> {{ currentUser.nickname || currentUser.name }}
        <b-icon-chevron-down />
      </b-list-group-item>
      <b-list-group-item class="bg-brown-2">
        <b-nav vertical>
          <b-nav-item @click="$auth.logout()">Sair</b-nav-item>
        </b-nav>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>
