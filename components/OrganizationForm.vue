<template>
  <div class="organization-form">
    <Breadcrumb :links="[['Cadastro', '/organizações']]" active="Organização" />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Organização" />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-5">
              <b-form-group label="Nome *">
                <b-form-input
                  v-model="form.name"
                  v-validate="'required'"
                  name="name"
                />
                <field-error :msg="veeErrors" field="name" />
              </b-form-group>
            </div>
            <b-col sm="2">
              <b-form-group label="Tipo *">
                <b-form-select
                  v-model="form.type"
                  v-validate="'required'"
                  class="form-control"
                  name="type"
                  :options="Tipo"
                />
                <field-error :msg="veeErrors" field="type" />
              </b-form-group>
            </b-col>
            <div class="col-sm-3">
              <b-form-group label="CNPJ ">
                <b-form-input v-model="form.cnpj" :mask="['###.###.###-##']" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <b-form-group label="Endereço ">
                <b-form-input v-model="form.address" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <b-col sm="6">
              <b-form-group label="Área de atuação">
                <b-form-select
                  v-model="form.OccupationArea"
                  class="form-control"
                  name="OccupationArea"
                  :options="área"
                />
              </b-form-group>
            </b-col>
            <div class="col-sm-6">
              <b-form-group label="Contato pessoal ">
                <b-form-input v-model="form.contact" name="contact" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <b-col sm="6">
              <b-form-group label="Elo na cadeia produtiva">
                <b-form-select
                  v-model="form.EloProdutiva"
                  class="form-control"
                  name="EloProdutiva"
                  :options="Elo"
                />
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group label="Região">
                <b-form-select
                  v-model="form.region"
                  class="form-control"
                  name="region"
                  :placeholder="'Selecione a região'"
                  :options="region"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <b-form-group label="Área protegida">
                <b-form-input
                  v-model="form.ProtectedArea"
                  name="ProtectedArea"
                />
              </b-form-group>
            </div>
            <div class="col-sm-4">
              <b-form-group label="Território castanhal">
                <b-form-input v-model="form.territory" name="territory" />
              </b-form-group>
            </div>
            <div class="col-sm-3">
              <b-form-group label="Cooperados (quantidade)">
                <b-form-input v-model="form.members" name="members" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <b-form-group label="Produtos">
                <b-form-checkbox-group
                  v-model="form.product"
                  :options="produtos"
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
import Breadcrumb from '@/components/Breadcrumb'
import tipos from '@/data/tipos.json'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      form: {
        name: '',
        type: '',
        cnpj: '',
        address: '',
        OccupationArea: '',
        contact: '',
        EloProdutiva: '',
        region: '',
        ProtectedArea: '',
        territory: '',
        members: '',
      },
    }
  },
  created() {
    this.tiposPermitidos = tipos
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }
  },
  methods: {
    list() {},
    edit(id) {
      this.is_loading = true
      this.$axios
        .get('organizations/' + id)
        .then((response) => {
          this.apiDataToForm(this.form, response.data)
          if (response.data.image) {
            this.images_preview = [response.data.image]
          }
          this.is_loading = false
        })
        .catch(this.showError)
    },
    save() {
      this.$validator.validate().then((isValid) => {
        if (isValid) {
          this.is_sending = true

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'organizations/' + this.$route.params.id
              : 'organizations',
            data: this.form,
          })
            .then((resp) => {
              const category = resp.data
              if (category && category._id) {
                this.notify('Organização salvo com sucesso')
                this.$router.replace('/organizacoes')
              }
              this.is_sending = false
            })
            .catch(this.showError)
        }
      })
    },
  },
}
</script>
