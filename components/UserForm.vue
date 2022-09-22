<template>
  <div class="user_form">
    <breadcrumb :active="'Cadastrar'" />
    <div class="panel">
      <div class="panel-body">
        <form-headline />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-6">
              <b-form-group :label="'Perfil' + ' *'">
                <b-form-radio-group
                  v-model="form.role"
                  name="role"
                ></b-form-radio-group>
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <b-form-group :label="'Nome' + ' *'">
                <b-form-input
                  v-model="form.name"
                  v-validate="'required'"
                  name="name"
                />
                <field-error :msg="veeErrors" field="name" />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group :label="'E-mail' + ' *'">
                <b-form-input v-model="form.email" name="email" />
                <field-error :msg="veeErrors" field="email" />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group :label="'Telefone'">
                <b-form-input
                  v-model="form.contact"
                  v-mask="['(##) ####-####', '(##) #####-####']"
                  name="contact"
                />
              </b-form-group>
              <b-form-group :label="'Telefone'">
                <b-form-input
                  v-model="form.cpf"
                  v-mask="['###.###.###-##']"
                  name="contact"
                />
              </b-form-group>
              <b-form-group :label="'cpf'">
                <the-mask v-model="form.cpf" :mask="['###.###.###-##']" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <b-form-group :label="'Senha'">
                <b-form-input
                  v-model="form.password"
                  type="password"
                  name="pass"
                />
                <field-error :msg="veeErrors" field="pass" />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group :label="'Confirmar senha'">
                <b-form-input
                  v-model="form.password_confirmation"
                  type="password"
                  name="pass_confirmation"
                />
                <field-error :msg="veeErrors" field="pass_confirmation" />
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
import Breadcrumb from '@/components/Breadcrumb'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      form: {
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        network: null,
        password: '',
        password_confirmation: '',
      },
    }
  },
}
</script>
