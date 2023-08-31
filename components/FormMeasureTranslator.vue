<template>
  <b-modal :id="id" hide-footer title="Conversões">
    <table class="table b-table">
      <thead>
        <tr>
          <th>Unidade</th>
          <th>Kg</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Lata/Latão</td>
          <!--<td>1</td>
                    <td>20</td>-->
          <td>12</td>
        </tr>
        <tr>
          <td>Caixa</td>
          <!--<td>2</td>
                    <td>40</td>-->
          <td>24</td>
        </tr>
        <tr>
          <td>Hectolitro</td>
          <!--<td>5</td>
                    <td>100</td>-->
          <td>60</td>
        </tr>
        <tr>
          <td>Saca</td>
          <!--<td>5</td>
                    <td>100</td>-->
          <td>48</td>
        </tr>
        <tr>
          <td>Barrica</td>
          <!--<td>6</td>
                    <td>120</td>-->
          <td>72</td>
        </tr>
        <tr>
          <td>Tonelada</td>
          <!--<td></td>
                    <td></td>-->
          <td>1000</td>
        </tr>
      </tbody>
    </table>
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
