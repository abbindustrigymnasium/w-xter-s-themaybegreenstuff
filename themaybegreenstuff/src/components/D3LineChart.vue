<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "D3LineChart",
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
  renderChart(data) {
    console.log("Rendering chart with data:", data);
    console.log("Chart container reference:", this.$refs.chartContainer);

    // Access the chart container
    const container = this.$refs.chartContainer;

    // Validate if the container is available
    if (!container) {
      console.error("chartContainer is undefined!");
      return;
    }

    // Clear previous chart
    container.innerHTML = "";

      // Define chart dimensions and scales
      const width = 928;
      const height = 500;
      const marginTop = 20;
      const marginRight = 30;
      const marginBottom = 30;
      const marginLeft = 40;

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

      const line = d3
        .line()
        .curve(d3.curveStep)
        .defined((d) => !isNaN(d.temperature))
        .x((d) => x(d.date))
        .y((d) => y(d.temperature));

      const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

      svg
        .append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        .call((g) => g.select(".domain").remove());

      svg
        .append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .select(".tick:last-of-type text")
            .append("tspan")
            .text("°F")
        );

      const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
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

      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", `url(#${gradientId})`)
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

      container.appendChild(svg.node());
    },
  },
  watch: {
    data: {
      immediate: true,
      handler(newData) {
        if (newData && newData.length) {
          this.renderChart(newData);
        }
      },
    },
  },
};
</script>

<style>
.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
