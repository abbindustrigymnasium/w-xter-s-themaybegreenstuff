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
            <q-slider v-model="hatch" :min="1" :max="255" label="Hatch" />
        </div>
        <div class="inline">
            <q-btn @click="stopFan" label="Stop" class="same-size-btn" />
            <q-slider v-model="fan" :min="1" :max="255" label="Fan" />
        </div>
        <div class="inline">
            <q-btn @click="stopPump" label="Stop" class="same-size-btn" />
            <q-slider v-model="pump" :min="1" :max="255" label="Pump" />
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
            hatch: 1, 
            fan: 1,
            pump: 1,
            // Current embedded state
            hatch_embedded: 1,
            fan_embedded: 1,
            pump_embedded: 1,
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
                // Decode the blob into a text string
                let rawData = event.data; // Get raw data
                let data;

                // Ensure we interpret it as ASCII (force correct encoding)
                if (typeof rawData === 'string') {
                    data = rawData;
                } else if (rawData instanceof Blob) {
                    // Convert Blob to Uint8Array and decode as ISO-8859-1
                    const arrayBuffer = await rawData.arrayBuffer();
                    const textDecoder = new TextDecoder('iso-8859-1');
                    data = textDecoder.decode(new Uint8Array(arrayBuffer));
                } else {
                    throw new Error('Unknown data format received');
                }

                // Ensure the data is exactly 3 characters
                if (data.length === 3) {
                    // Convert ASCII characters to numeric values
                    const hatchRaw = data.charCodeAt(0); // Hatch
                    const fanRaw = data.charCodeAt(1);   // Fan
                    const pumpRaw = data.charCodeAt(2);  // Pump

                    // Safely map the values to a 0-100% range
                    this.hatch_embedded = Math.round((hatchRaw / 255) * 100);
                    this.fan_embedded = Math.round((fanRaw / 255) * 100);
                    this.pump_embedded = Math.round((pumpRaw / 255) * 100);

                    // Update the table row with the new values
                    this.rows[0].hatch_embedded = this.hatch_embedded;
                    this.rows[0].fan_embedded = this.fan_embedded;
                    this.rows[0].pump_embedded = this.pump_embedded;

                    console.log(
                        'Updated Values:',
                        this.hatch_embedded,
                        this.fan_embedded,
                        this.pump_embedded
                    );
                } else {
                    console.error('Received data is not a valid 3-character blob:', data);
                }
            } catch (error) {
                console.error('Error processing received data:', error);
            }
        };
    },
    methods: {
        sendData() {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                const json_obj = { msg: [this.hatch, this.fan, this.pump], forward_to: ['embedded_device'] };
                this.socket.send(JSON.stringify(json_obj));
            } else {
                console.warn('WebSocket is not open. Data not sent.');
            }
        },
        closeHatch() {
            this.hatch = 1;
            this.sendData();
        },
        stopFan() {
            this.fan = 1;
            this.sendData();
        },
        stopPump() {
            this.pump = 1;
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
}
.q-pa-md {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>
