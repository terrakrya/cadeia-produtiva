<template>
    <b-modal :id="id" hide-footer>
        <template #modal-title> Conversões</template>
            <table class="table b-table b-table-stacked-md table-striped">
                <thead>
                    <tr>
                      <th>Unidade</th>
                      <!--<th>Lata</th>
                      <th>Litros</th>-->
                      <th>Kg</th>
                      <th></th>
                    </tr>
                </thead>
                <tbody>
                    <td>Lata/Latão</td>
                    <!--<td>1</td>
                    <td>20</td>-->
                    <td>12</td>
                </tbody>
                <tbody>
                    <td>Caixa</td>
                    <!--<td>2</td>
                    <td>40</td>-->
                    <td>24</td>
                </tbody>
                <tbody>
                    <td>Hectolitro</td>
                    <!--<td>5</td>
                    <td>100</td>-->
                    <td>60</td>
                </tbody>
                <tbody>
                    <td>Saca</td>
                    <!--<td>5</td>
                    <td>100</td>-->
                    <td>60</td>
                </tbody>
                <tbody>
                    <td>Barrica</td>
                    <!--<td>6</td>
                    <td>120</td>-->
                    <td>72</td>
                </tbody>
                <tbody>
                    <td>Tonelada</td>
                    <!--<td></td>
                    <td></td>-->
                    <td>1000</td>
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
     id: '',
    },
}
</script>