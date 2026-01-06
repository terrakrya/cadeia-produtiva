<template>
  <div class="line-chart-wrapper">
    <!-- Toggle para alternar entre Gráfico e Tabela -->
    <div class="chart-header">
      <div class="view-toggle" role="tablist" aria-label="Alternar visualização">
        <button 
          type="button"
          role="tab"
          :class="['toggle-btn', { active: !showDataTable }]"
          :aria-selected="!showDataTable"
          @click="showDataTable = false"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>Gráfico</span>
        </button>
        <button 
          type="button"
          role="tab"
          :class="['toggle-btn', { active: showDataTable }]"
          :aria-selected="showDataTable"
          @click="showDataTable = true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          <span>Tabela</span>
        </button>
      </div>
    </div>

    <!-- Visualização: Gráfico -->
    <div v-show="!showDataTable" class="line-chart-container">
      <canvas ref="canvas"></canvas>
    </div>
    
    <!-- Visualização: Tabela de dados (acessível via teclado e leitores de tela) -->
    <div 
      v-show="showDataTable"
      class="data-table-container"
      role="region"
      aria-label="Dados do gráfico em formato de tabela"
    >
      <table>
        <caption class="sr-only">{{ chartTitle || 'Dados do gráfico' }}</caption>
        <thead>
          <tr>
            <th scope="col">Período</th>
            <th 
              v-for="dataset in chartData.datasets" 
              :key="dataset.label" 
              scope="col"
            >
              {{ dataset.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, rowIndex) in sortedTableData" :key="rowIndex">
            <th 
              scope="row"
              tabindex="0"
              class="focusable-cell"
              :aria-label="'Período: ' + item.label"
            >
              {{ item.label }}
            </th>
            <td 
              v-for="(value, colIndex) in item.values" 
              :key="colIndex"
              tabindex="0"
              class="focusable-cell"
              :aria-label="item.label + ', ' + chartData.datasets[colIndex].label + ': ' + formatValue(value)"
            >
              {{ formatValue(value) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs'
import { Chart } from 'chart.js'

export default {
  extends: Line,

  data() {
    return {
      showDataTable: false
    }
  },

  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartTitle: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default: () => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              suggestedMax: 0
            }
          }],
          xAxes: [{
            ticks: {
              maxRotation: 90,
              minRotation: 90
            }
          }]
        },
        legend: {
          labels: { fontSize: 12 }
        },
        tooltips: {
          titleFontSize: 12,
          bodyFontSize: 12
        },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'top',
            font: { size: 10 }
          }
        }
      })
    }
  },

  computed: {
    /**
     * Retorna os dados da tabela ordenados cronologicamente (ano > mês > semana)
     */
    sortedTableData() {
      const labels = this.chartData.labels || []
      const datasets = this.chartData.datasets || []
      
      if (!labels.length) return []
      
      const tableData = labels.map((label, index) => ({
        label,
        values: datasets.map(ds => ds.data[index]),
        sortKey: this.parsePeriodLabel(label)
      }))
      
      // Ordena por ano, depois mês, depois semana
      return tableData.sort((a, b) => {
        if (a.sortKey.year !== b.sortKey.year) return a.sortKey.year - b.sortKey.year
        if (a.sortKey.month !== b.sortKey.month) return a.sortKey.month - b.sortKey.month
        return a.sortKey.week - b.sortKey.week
      })
    }
  },

  mounted() {
    this.updateChartOptions()
    this.renderChart()
  },

  watch: {
    chartData: {
      handler(newData, oldData) {
        if (!this.areDataEqual(newData, oldData)) {
          this.$data._chart.destroy()
          this.updateChartOptions()
          this.renderChart()
        }
      },
      deep: true
    }
  },

  methods: {
    /**
     * Renderiza o gráfico no canvas
     */
    renderChart() {
      this.$data._chart = new Chart(this.$refs.canvas.getContext('2d'), {
        type: 'line',
        data: this.chartData,
        options: this.options
      })
    },

    /**
     * Atualiza o limite máximo do eixo Y baseado nos dados
     */
    updateChartOptions() {
      const allValues = this.chartData.datasets.flatMap(ds => ds.data)
      const maxValue = Math.max(...allValues)
      this.options.scales.yAxes[0].ticks.suggestedMax = maxValue * 1.1
    },

    /**
     * Compara dois objetos de dados para evitar re-renderização desnecessária
     */
    areDataEqual(newData, oldData) {
      const safeStringify = (obj) => {
        const seen = new Set()
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) return
            seen.add(value)
          }
          return value
        })
      }
      return safeStringify(newData) === safeStringify(oldData)
    },

    /**
     * Formata valor numérico para exibição (formato brasileiro)
     */
    formatValue(value) {
      if (value === null || value === undefined) return 'N/A'
      if (typeof value === 'number') {
        return value.toLocaleString('pt-BR', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })
      }
      return value
    },

    /**
     * Extrai ano, mês e semana de um label de período
     * Suporta: "S1 - Jan/2025", "Semana 1 - 01/2025", "S1 01/2025"
     */
    parsePeriodLabel(label) {
      const result = { year: 0, month: 0, week: 0 }
      if (!label || typeof label !== 'string') return result

      // Extrai semana (S1, Semana 1, etc.)
      const weekMatch = label.match(/[Ss](?:emana)?\s*(\d+)/i)
      if (weekMatch) result.week = parseInt(weekMatch[1], 10)
      
      // Extrai ano (4 dígitos)
      const yearMatch = label.match(/(\d{4})/)
      if (yearMatch) result.year = parseInt(yearMatch[1], 10)
      
      // Extrai mês - formato numérico (01/2025)
      const monthNumMatch = label.match(/(\d{1,2})\/\d{4}/)
      if (monthNumMatch) {
        result.month = parseInt(monthNumMatch[1], 10)
      } else {
        // Formato texto (Jan, Fev, etc.)
        const monthNames = {
          jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
          jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12
        }
        const monthTextMatch = label.toLowerCase().match(/(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/)
        if (monthTextMatch) result.month = monthNames[monthTextMatch[1]] || 0
      }
      
      return result
    }
  }
}
</script>

<style scoped>
.line-chart-wrapper {
  width: 100%;
}

/* === TOGGLE GRÁFICO/TABELA === */
.chart-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.view-toggle {
  display: inline-flex;
  background-color: #f2f2f2;
  border-radius: 50px;
  padding: 4px;
  gap: 4px;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #666;
  background-color: transparent;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover:not(.active) {
  color: #852E27;
  background-color: rgba(133, 46, 39, 0.08);
}

.toggle-btn.active {
  color: #fff;
  background-color: #852E27;
  box-shadow: 0 2px 4px rgba(133, 46, 39, 0.25);
}

.toggle-btn svg {
  flex-shrink: 0;
}

/* === GRÁFICO === */
.line-chart-container {
  position: relative;
  width: 100%;
  height: 400px;
}

canvas {
  width: 100%;
  height: 100%;
}

/* === TABELA DE DADOS === */
.data-table-container {
  overflow-x: auto;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.data-table-container table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table-container th,
.data-table-container td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table-container thead th {
  background-color: #852E27;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.data-table-container thead th:first-child {
  border-top-left-radius: 8px;
}

.data-table-container thead th:last-child {
  border-top-right-radius: 8px;
}

.data-table-container tbody tr:hover {
  background-color: #f9f5f5;
}

.data-table-container tbody tr:last-child td,
.data-table-container tbody tr:last-child th {
  border-bottom: none;
}

.data-table-container tbody th {
  font-weight: 600;
  color: #333;
  background-color: #f9f9f9;
}

.data-table-container tbody td {
  color: #666;
  font-weight: 500;
}

/* === CÉLULAS FOCÁVEIS (acessibilidade) === */
.focusable-cell {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.focusable-cell:focus {
  outline: none;
}

.focusable-cell:focus-visible {
  outline: 3px solid #852E27;
  outline-offset: -3px;
  box-shadow: inset 0 0 0 2px #fff;
  background-color: #FFF8E7;
  position: relative;
  z-index: 1;
}

/* Oculta visualmente mas mantém acessível para leitores de tela */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* === RESPONSIVIDADE MOBILE === */
@media (max-width: 576px) {
  .toggle-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .toggle-btn span {
    display: none;
  }
  
  .toggle-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .data-table-container th,
  .data-table-container td {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
