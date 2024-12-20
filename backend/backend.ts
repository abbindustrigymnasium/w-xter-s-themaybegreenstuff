const { createServer } = require('node:http');
const { WebSocketServer } = require('ws');
const readline = require('readline');



const hostname = '0.0.0.0';
const port = 3000;

// Create an HTTP server
const server = createServer((req: any, res: any) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!\n');
});

// Create a WebSocket server using the same HTTP server
const wss = new WebSocketServer({ server });



function sendToAll(message: string) {
    wss.clients.forEach((client: any) => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws: any) => {
    console.log('New WebSocket connection established.');

    // Handle incoming messages from the client
    ws.on('message', (message: any) => {
        sendToAll(message);
    });

    // Send a welcome message to the client
    ws.send('Welcome to the WebSocket server!');
});

// Create a readline interface for CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Broadcast a message to all connected clients
function broadcastMessage(message: string) {
    wss.clients.forEach((client: any) => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

// Listen for CLI input and broadcast messages
rl.on('line', (input: string) => {
    broadcastMessage(input);
});

// Start the HTTP server
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});