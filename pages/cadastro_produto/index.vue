<template>
  <div class="product">
    <Breadcrumb active="Cadastro de produtos"></Breadcrumb>
    <div class="panel">
      <div class="panel-body">
        <div class="col-sm-6">
          <h1>Cadastro de produtos</h1>
        </div>
        <br />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-6">
              <b-form-group label="Código *">
                <b-form-input
                  v-model="form.code"
                  v-validate="'required'"
                  name="code"
                />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group label="Descrição *">
                <b-form-input
                  v-model="form.code"
                  v-validate="'required'"
                  name="description"
                />
              </b-form-group>
            </div>
          </div>
          <form-submit :sending="is_sending" />
        </b-form>
      </div>
    </div>
  </div>
</template>
<script>
import Breadcrumb from '~/components/Breadcrumb.vue'
export default {
  data() {
    return {
      form: {
        code: '',
        description: '',
      },
    }
  },
  computed: {
    Breadcrumb,
  },
  methods: {
    save() {
      this.$validator.validate().then(async (isValid) => {})
    },
  },
}
</script>
