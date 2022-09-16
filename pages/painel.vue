<template>
  <div>
    <breadcrumb active="Minha conta" />
    <b-container fluid class="mb-4">
      <b-card-group deck>
        <b-card no-body>
          <b-card-header>
            <i class="fas fa-tools" /> Operacional
          </b-card-header>
          <b-card-body>
            <n-link class="btn btn-secondary mr-1 mb-1" to="/estoque">
              Estoque
            </n-link>
          </b-card-body>
        </b-card>
      </b-card-group>
    </b-container>
  </div>
</template>
<script>
import Breadcrumb from '@/components/Breadcrumb'
export default {
  components: {
    Breadcrumb,
  },
}
</script>
