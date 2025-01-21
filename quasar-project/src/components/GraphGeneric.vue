<template>
    <q-card class="q-pa-md" flat bordered>
      <q-card-section>
        <div ref="chart" class="chart-container"></div>
      </q-card-section>
    </q-card>
  </template>
  
  <script>
  import * as d3 from "d3";
  
  export default {
    name: "GraphGeneric",
    props: {
      data: {
        type: Array,
        required: false,
        default: () => [], // Default empty array
      },
    },
    data() {
      return {
        defaultData: [
          { date: new Date(2021, 0, 1), temperature: 70 },
          { date: new Date(2021, 0, 2), temperature: 69 },
          { date: new Date(2021, 0, 3), temperature: 68 },
          { date: new Date(2021, 0, 4), temperature: 69 },
        ],
      };
    },
    computed: {
      chartData() {
        // Use defaultData if no valid data is provided
        return Array.isArray(this.data) && this.data.length > 0 ? this.data : this.defaultData;
      },
    },
    methods: {
      drawChart() {
        const data = this.chartData;
  
        // Exit early if no valid data
        if (!data || data.length === 0) {
          console.warn("No data available to render the chart.");
          d3.select(this.$refs.chart).selectAll("*").remove(); // Clear the chart container
          return;
        }
  
        // Chart dimensions and margins
        const width = 928;
        const height = 500;
        const marginTop = 20;
        const marginRight = 30;
        const marginBottom = 30;
        const marginLeft = 40;
  
        // Define scales
        const x = d3
          .scaleUtc()
          .domain(d3.extent(data, (d) => d.date))
          .range([marginLeft, width - marginRight]);
  
        const y = d3
          .scaleLinear()
          .domain(d3.extent(data, (d) => d.temperature))
          .nice()
          .range([height - marginBottom, marginTop]);
  
        const color = d3.scaleSequential(y.domain(), d3.interpolateTurbo);
  
        // Line generator
        const line = d3
          .line()
          .curve(d3.curveStep)
          .defined((d) => !isNaN(d.temperature))
          .x((d) => x(d.date))
          .y((d) => y(d.temperature));
  
        // Clear existing content
        d3.select(this.$refs.chart).selectAll("*").remove();
  
        // Create SVG container
        const svg = d3
          .select(this.$refs.chart)
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height])
          .attr("style", "max-width: 100%; height: auto;");
  
        // X-axis
        svg
          .append("g")
          .attr("transform", `translate(0,${height - marginBottom})`)
          .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
          .call((g) => g.select(".domain").remove());
  
        // Y-axis
        svg
          .append("g")
          .attr("transform", `translate(${marginLeft},0)`)
          .call(d3.axisLeft(y))
          .call((g) => g.select(".domain").remove())
          .call((g) =>
            g
              .select(".tick:last-of-type text")
              .append("tspan")
              .text("°C")
          );
  
        // Gradient
        const gradientId = "gradient-" + Math.random().toString(36).substring(2);
        svg
          .append("linearGradient")
          .attr("id", gradientId)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", 0)
          .attr("y1", height - marginBottom)
          .attr("x2", 0)
          .attr("y2", marginTop)
          .selectAll("stop")
          .data(d3.ticks(0, 1, 10))
          .join("stop")
          .attr("offset", (d) => d)
          .attr("stop-color", color.interpolator());
  
        // Line path
        svg
          .append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", `url(#${gradientId})`)
          .attr("stroke-width", 1.5)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("d", line);
      },
    },
    mounted() { // Call drawChart when the component mounts
      this.drawChart();
    },
    watch: {
      data: {
        handler: "drawChart", // Redraw the chart whenever data changes
        immediate: true, // Ensure the chart renders immediately on mount
      },
    },
  };
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    overflow-x: auto;
  }
  </style>
  