<template> 
    <div class="q-pa-md">
        <!-- Current Params -->
        <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            hide-bottom
        >
            <!-- Custom slots for columns -->
            <template v-slot:body-cell-hatch="props">
                <q-td :props="props">
                    {{ props.row.hatch_embedded }}%
                </q-td>
            </template>

            <template v-slot:body-cell-fan="props">
                <q-td :props="props">
                    {{ props.row.fan_embedded }}%
                </q-td>
            </template>

            <template v-slot:body-cell-pump="props">
                <q-td :props="props">
                    {{ props.row.pump_embedded }}%
                </q-td>
            </template>
        </q-table>

        <!-- Control of the Greenhouse -->
        <div class="inline">
            <q-btn @click="closeHatch" label="Close" class="same-size-btn" />
            <q-slider v-model="hatch" :min="0" :max="255" label="Hatch" />
        </div>
        <div class="inline">
            <q-btn @click="stopFan" label="Stop" class="same-size-btn" />
            <q-slider v-model="fan" :min="0" :max="255" label="Fan" />
        </div>
        <div class="inline">
            <q-btn @click="stopPump" label="Stop" class="same-size-btn" />
            <q-slider v-model="pump" :min="0" :max="255" label="Pump" />
        </div>
        <q-btn label="Send" @click="sendData" />
    </div>
</template>

<script>
export default {
    name: 'GreenHouseController',
    data() {
        return {
            // Table columns definition
            columns: [
                { name: 'hatch', required: true, label: 'Hatch (%)', align: 'center', field: 'hatch_embedded' },
                { name: 'fan', label: 'Fan (%)', align: 'center', field: 'fan_embedded' },
                { name: 'pump', label: 'Pump (%)', align: 'center', field: 'pump_embedded' }
            ],
            // Table rows definition
            rows: [
                { id: 1, hatch_embedded: 1, fan_embedded: 1, pump_embedded: 1 }
            ],
            // Slider-controlled values
            hatch: 0, 
            fan: 0,
            pump: 0,
            // Current embedded state
            hatch_embedded: 0,
            fan_embedded: 0,
            pump_embedded: 0,
            // WebSocket settings
            socket: null, 
            socket_embedded: null, 
            hostIP: window.location.hostname,
            port: 3000
        };
    },
    mounted() {
        // Initialize WebSocket connections
        const wsURL = `ws://${this.hostIP}:${this.port}?type=web_client`; 
        const wsURL_embedded = `ws://${this.hostIP}:${this.port}?type=embedded_device`; 

        this.socket = new WebSocket(wsURL);
        this.socket_embedded = new WebSocket(wsURL_embedded);

        // Listen for messages from the embedded device
        this.socket_embedded.onmessage = async (event) => {
            try {
                let rawData = event.data; // Get raw data
                let data;

                // Decode incoming data as an ASCII string
                if (typeof rawData === 'string') {
                    data = rawData;
                } else if (rawData instanceof Blob) {
                    const arrayBuffer = await rawData.arrayBuffer();
                    const textDecoder = new TextDecoder('iso-8859-1');
                    data = textDecoder.decode(new Uint8Array(arrayBuffer));
                } else {
                    console.error("Error: Unknown data format received");
                    return;
                }

                // Parse values assuming the format: hatch,fan,pump
                const values = data.split(',').map(Number);
                if (values.length === 3 && values.every(n => !isNaN(n))) {
                    // Clamp values to range [0, 255]
                    this.hatch_embedded = Math.min(255, Math.max(0, values[0]));
                    this.fan_embedded = Math.min(255, Math.max(0, values[1]));
                    this.pump_embedded = Math.min(255, Math.max(0, values[2]));

                    // Update the table row with new values
                    this.rows[0].hatch_embedded = this.map(this.hatch_embedded, 0, 255, 0, 100);
                    this.rows[0].fan_embedded = this.map(this.fan_embedded, 0, 255, 0, 100);
                    this.rows[0].pump_embedded = this.map(this.pump_embedded, 0 , 255, 0, 100);

                    console.log(
                        "Updated Values:",
                        this.hatch_embedded,
                        this.fan_embedded,
                        this.pump_embedded
                    );
                } else {
                    console.error("Error: Invalid input format", data);
                }
            } catch (error) {
                console.error("Error processing received data:", error);
            }
        };
    },
    methods: {
        map(value, fromLow, fromHigh, toLow, toHigh) {
            return Math.round(((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow);
        },
        sendData() {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                const json_obj = { 
                    msg: [String(this.hatch), String(this.fan), String(this.pump)], 
                    forward_to: ['embedded_device'] 
                };
                this.socket.send(JSON.stringify(json_obj));
            } else {
                console.warn('WebSocket is not open. Data not sent.');
            }
        },
        closeHatch() {
            this.hatch = 0;
            this.sendData();
        },
        stopFan() {
            this.fan = 0;
            this.sendData();
        },
        stopPump() {
            this.pump = 0;
            this.sendData();
        },
    },
    beforeUnmount() {
        // Close WebSocket connections when the component is destroyed
        if (this.socket) {
            this.socket.close();
        }
        if (this.socket_embedded) {
            this.socket_embedded.close();
        }
    }
};
</script>

<style scoped>
.same-size-btn {
    width: 80px;
}
.inline {
    display: flex;
    flex-direction: row;
    gap: 20px; 
    background-color: white;
    margin: 5px;
    border-radius: 10px;
}

.q-btn {
    background-color: white;
    border-radius: 10px;
}

.q-table__container {
    border-radius: 10px;
}

.q-pa-md {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>
