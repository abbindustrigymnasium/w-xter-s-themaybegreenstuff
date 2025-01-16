<template>
    <div ref="chart" style="width: 100%; height: 300px;"></div>
</template>

<script lang='ts'>
import * as d3 from 'd3'
import { list } from 'postcss';

export default {
    name: 'GraphGeneric',
    props: {
        items: {
            type: list,
            default: () => [10, 40, 25, 60, 80]
        }
    },
    async mounted() {
        const width = this.$refs.chart.clientWidth;
        const height = this.$refs.chart.clientHeight;
        //await this.make_ws_connection();

        const hostIP = window.location.hostname;
        const ws = new WebSocket(`ws://${hostIP}:3000?client_type=client`); // ws connection

        ws.onopen = () => { // Create a ws connection
            console.log('WebSocket connection opened');
        };

        ws.addEventListener('message', async (event) => { // Listen for messages from the server
            if (event.data instanceof Blob) {
                const text = await event.data.text(); // Convert Blob to text
                console.log('Blob as text:', text); 
            } else {
                console.log('Received non-Blob data:', event.data);
            }
        });


        const svg = d3.select(this.$refs.chart)
            .append('svg')
            .attr('width', width)  // <-- changed code
            .attr('height', height) // <-- changed code

        const xScale = d3.scaleBand()
            .domain(this.items.map((_, i) => i))
            .range([0, width])
            .padding(0.1)

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(this.items)])
            .range([height, 0])

        svg.selectAll('rect')
            .data(this.items)
            .enter()
            .append('rect')
            .attr('x', (_, i) => xScale(i))
            .attr('y', d => yScale(d))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d))
            .attr('fill', 'steelblue')
    }
}
</script>

<style scoped>
/* Add your styles here */
</style>