<template>
  <div class="q-pa-md">
    <q-card flat bordered>
      <q-inner-loading :showing="!isConnected">
        <q-spinner-dots size="50px" color="primary" />
      </q-inner-loading>
      <q-card-section style="height: 400px;">
        <canvas ref="chart"></canvas>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

export default {
  name: 'GraphWebSocket',
  data() {
    return {
      chartInstance: null,
      socket: null,
      // Holds a plain JavaScript array of data objects (non‑reactive)
      chartData: [],
      isConnected: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectTimeout: null,
      hasReceivedData: false,
    };
  },
  methods: {
    // Flattens nested arrays if necessary.
    flattenData(data) {
      return data.reduce((acc, item) => {
        return acc.concat(Array.isArray(item) ? item : [item]);
      }, []);
    },

    // (Re)creates the entire chart with the current data set.
    renderChart(dataArray) {
      if (!this.$refs.chart) {
        console.error('Chart reference is not available.');
        return;
      }
      const ctx = this.$refs.chart.getContext('2d');

      // Destroy any existing chart instance.
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      // Deep clone the data to remove any Vue reactivity.
      const plainData = JSON.parse(JSON.stringify(dataArray));
      const dataPoints = plainData.map(d => ({
        x: new Date(d.created_at),
        tempY: d.temp,
        humY: d.hum,
      }));

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Temperature (°C)',
              data: dataPoints,
              parsing: {
                xAxisKey: 'x',
                yAxisKey: 'tempY',
              },
              borderColor: 'red',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: false,
              tension: 0,
              pointRadius: 0,
              borderWidth: 1,
              // Assign temperature to the left y‑axis
              yAxisID: 'y1',
            },
            {
              label: 'Humidity (%)',
              data: dataPoints,
              parsing: {
                xAxisKey: 'x',
                yAxisKey: 'humY',
              },
              borderColor: 'blue',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: false,
              tension: 0,
              pointRadius: 0,
              borderWidth: 1,
              // Assign humidity to the right y‑axis
              yAxisID: 'y2',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          spanGaps: true,
          scales: {
            x: {
              type: 'time',
              time: { unit: 'minute' },
              title: { display: true, text: 'Time' },
              ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
            },
            // Left y‑axis for Temperature:
            y1: {
              display: true, // we'll update this dynamically
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Temperature (°C)' },
            },
            // Right y‑axis for Humidity:
            y2: {
              display: true, // we'll update this dynamically
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Humidity (%)' },
              grid: {
                drawOnChartArea: false, // prevents grid lines from overlapping with y1
              },
            },
          },
          plugins: {
            tooltip: { mode: 'index', intersect: false },
            legend: {
              position: 'top',
              // Custom legend onClick handler to toggle axis visibility
              onClick: (e, legendItem, legend) => {
                const chart = legend.chart;
                const datasetIndex = legendItem.datasetIndex;
                const meta = chart.getDatasetMeta(datasetIndex);
                // Toggle the hidden state for the clicked dataset.
                meta.hidden = meta.hidden === null ? !chart.data.datasets[datasetIndex].hidden : null;
                
                // Check for each y‑axis if at least one dataset is visible.
                let y1Visible = false;
                let y2Visible = false;
                chart.data.datasets.forEach((ds, idx) => {
                  const meta = chart.getDatasetMeta(idx);
                  if (ds.yAxisID === 'y1' && !meta.hidden) {
                    y1Visible = true;
                  }
                  if (ds.yAxisID === 'y2' && !meta.hidden) {
                    y2Visible = true;
                  }
                });
                
                // Set the axis display options accordingly.
                chart.options.scales.y1.display = y1Visible;
                chart.options.scales.y2.display = y2Visible;
                chart.update();
              },
            },
            decimation: { enabled: false },
          },
          interaction: { mode: 'nearest', axis: 'x', intersect: false },
        },
      });
    },

    setupWebSocket() {
      this.socket = new WebSocket('ws://localhost:3000?type=graph_component');

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        // The incoming data is always an array.
        const rawData = JSON.parse(event.data);
        // Flatten it in case any nested arrays exist.
        const data = this.flattenData(rawData);

        if (!this.hasReceivedData) {
          // On first message: render the chart with the initial data.
          this.hasReceivedData = true;
          this.chartData = JSON.parse(JSON.stringify(data));
          this.renderChart(this.chartData);
        } else {
          // For subsequent messages: add new data items.
          data.forEach(item => {
            this.chartData.push(JSON.parse(JSON.stringify(item)));
          });
          this.renderChart(this.chartData);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    },

    handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.reconnectTimeout = setTimeout(() => {
          console.log(
            `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
          );
          this.setupWebSocket();
        }, 3000);
      } else {
        console.error('Max reconnection attempts reached');
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      if (this.$refs.chart) {
        this.setupWebSocket();
      }
    });
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.close();
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  },
};
</script>

<style scoped>
.q-pa-md {
  padding: 0;
  width: 100%;
  border-radius: 10px;
}
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
