<template>
  <b-modal :id="id" hide-footer title="Conversões">
    <table class="table b-table">
      <thead>
        <tr>
          <th>Unidade</th>
          <th>Caixa</th>
          <th>Kg</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Lata</td>
          <td class="td-caixa">1</td>
          <!-- <--<td>20</td>-->
          <td>12</td>
        </tr>
        <tr>
          <td>Caixa</td>
          <td class="td-caixa">2</td>
          <!--   <td>40</td>-->
          <td>24</td>
        </tr>
        <tr>
          <td>Saca</td>
          <td class="td-caixa">5</td>
          <!--<td>100</td>-->
          <td>48</td>
        </tr>
        <tr>
          <td>Hectolitro</td>
          <td class="td-caixa">5</td>
          <!--<td>100</td>-->
          <td>60</td>
        </tr>
        <tr>
          <td>Barrica</td>
          <td class="td-caixa">6</td>
          <!-- <td>120</td>-->
          <td>72</td>
        </tr>
        <tr>
          <td>Tonelada</td>
          <td></td>
          <!--<td></td>-->
          <td>1000</td>
        </tr>
      </tbody>
    </table>
    <div class="explanatory-text">
      Por conta da umidade presente na castanha, o peso da lata pode variar de
      10 a 13 kg. Os preços aqui informados são preços médios estimados,
      calculados com base na conversão de 1 lata = 12 kg, valor definido
      levantamento realizado com membros do OCA e do Coletivo da Castanha.
    </div>
    <b-button
      class="btn btn-primary"
      variant="danger"
      block
      @click="$bvModal.hide(id)"
      >Fechar</b-button
    >
  </b-modal>
</template>
<script>
export default {
  name: 'FormMeasureTranslator',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
}
</script>
