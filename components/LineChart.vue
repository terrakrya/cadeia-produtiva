<canvas ref="canvas"></canvas>

<script>
import { Line } from 'vue-chartjs'
import { Chart } from 'chart.js'

export default {
  extends: Line,
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                suggestedMax: 0, // Será ajustado dinamicamente
              },
            },
          ],
          xAxes: [
            {
              ticks: {
                maxRotation: 90,
                minRotation: 90,
              },
            },
          ],
        },
        legend: {
          labels: {
            fontSize: 12, // Tamanho da fonte das labels da legenda
          },
        },
        tooltips: {
          titleFontSize: 12, // Tamanho da fonte do título do tooltip
          bodyFontSize: 12, // Tamanho da fonte do corpo do tooltip
        },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'top',
            font: {
              size: 10, // Tamanho da fonte das labels dos dados
            },
          },
        },
      }),
    },
  },
  mounted() {
    this.updateChartOptions();
    this.renderChart();
  },
  watch: {
    chartData: {
      handler(newData, oldData) {
        if (!this.areDataEqual(newData, oldData)) {
          this.$data._chart.destroy();
          this.updateChartOptions();
          this.renderChart();
        }
      },
      deep: true,
    },
  },
  methods: {
    renderChart() {
      this.$data._chart = new Chart(this.$refs.canvas.getContext('2d'), {
        type: 'line',
        data: this.chartData,
        options: this.options,
      });
    },
    areDataEqual(newData, oldData) {
      return JSON.stringify(newData) === JSON.stringify(oldData);
    },
    updateChartOptions() {
      const maxDataValue = Math.max(...this.chartData.datasets.flatMap(dataset => dataset.data));
      this.options.scales.yAxes[0].ticks.suggestedMax = maxDataValue + 10;
    },
  },
};
</script>

<style scoped>
canvas {
  width: 100%;
  height: 400px;
}
</style>
