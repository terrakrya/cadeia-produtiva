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
      }),
    },
  },
  mounted() {
    this.renderChart(this.chartData, this.options)
  },
  watch: {
    chartData: {
      handler(newData, oldData) {
        if (!this.areDataEqual(newData, oldData)) {
          this.$data._chart.destroy()
          this.renderChart(newData, this.options)
        }
      },
      deep: true,
    },
  },
  methods: {
    renderChart(data, options) {
      this.$data._chart = new Chart(this.$refs.canvas.getContext('2d'), {
        type: 'line',
        data,
        options,
      })
    },
    areDataEqual(newData, oldData) {
      if (newData.labels.length !== oldData.labels.length) {
        return false
      }
      if (newData.datasets.length !== oldData.datasets.length) {
        return false
      }
      for (let i = 0; i < newData.labels.length; i++) {
        if (newData.labels[i] !== oldData.labels[i]) {
          return false
        }
      }
      for (let i = 0; i < newData.datasets.length; i++) {
        if (
          newData.datasets[i].data.length !== oldData.datasets[i].data.length
        ) {
          return false
        }
        for (let j = 0; j < newData.datasets[i].data.length; j++) {
          if (newData.datasets[i].data[j] !== oldData.datasets[i].data[j]) {
            return false
          }
        }
      }
      return true
    },
  },
}
</script>

<style scoped>
canvas {
  width: 100%;
  height: 400px;
}
</style>
