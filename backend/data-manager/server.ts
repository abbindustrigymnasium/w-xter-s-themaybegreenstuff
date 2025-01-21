import { UserAuth } from './userAuth';
import PrettyConsole from '../generalUtils';
import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import WebSocket, {WebSocketServer} from 'ws';
import { URLSearchParams } from 'url';


// Load environment variables from .dev.env file
dotenv.config({ path: '../../.dev.env' });

// Instantiate the userAuth and PrettyConsole classes
const userAuth = new UserAuth();
const prettyConsole = new PrettyConsole();


// set the port for the auth server
if (!process.env.PORT_AUTH) {
    prettyConsole.logWarning(
        'PORT_AUTH environment variable is not set. Continuing with default value. Please set PORT_AUTH to mitigate this warning.'
    );
}
const PORT = process.env.PORT_AUTH || 3000;
if (process.env.DEBUG) {
    prettyConsole.logInfo(`Backend is using port: ${PORT}`);
}

const PORT2 = process.env.PORT_EMB || 3001;
if (process.env.DEBUG) {
    prettyConsole.logInfo(`Backend is using port: ${PORT2} for embedded devices`);
}


const app = express();
app.use(express.json());

// Allow requests from the frontend origin TODO: Add safe origin
app.use(
    cors({
        origin: '*', // Allow all origins
        methods: ['GET', 'POST', 'OPTIONS'], // Allowed methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    })
);

// TODO: Remove this user generation method when the actual method is implemented
// userAuth.generateUser('', '', '');

app.post('/auth', async (req: any, res: any) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const token = await userAuth.getAuthToken(username, password);

        if (typeof token === 'string') {
            return res.json({ token });
        } else {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        prettyConsole.logError(`Error during authentication: ${error}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Returns the auth level of the given jwt
app.post('/JWTAuthLevel', async (req: any, res: any) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token not provided' });
    }

    if (!userAuth.checkJWTexpiration(token)) {
        return res.status(401).json({ error: 'Token expired' });
    }

    try {
        const authlevel = await userAuth.getAuthLevelFromJWT(token);
        if (typeof authlevel === "number") {
            if(process.env.DEBUG) prettyConsole.logSuccess(`Permission Level returned to user: `, authlevel);
            return res.json({ authlevel });
        } else {
            return res.status(500).json({ error: 'Internal server error' });
        }
    } catch (error) { 
        prettyConsole.logError(`Error authenticating with auth level from jwt`);
        return res.status(500).json({ error: 'Internal server error' });
    }

});





// -----------------------------------------------------------------------
// WebSocket server for website graphs
// -----------------------------------------------------------------------

// Start the Express server
const server = app.listen(PORT, () => {
    prettyConsole.logSuccess(`Started website backend server`);
});

// Example usage with wscat : wscat -c ws://localhost:3000?client_type=client
///NOTE:  clients who wish to receive broadcast messages need to specify the client_type query parameter as 'client'
const wss = new WebSocketServer({ server });
prettyConsole.logSuccess('WebSocket server started');

app.post('/data', async (req: any, res: any) => {
    prettyConsole.logWarning('Data received:', req.body);
    // Broadcast the received data to all connected WebSocket clients
    wss.clients.forEach((client) => {
        let temp:number;
        let hum:number;
        let key:string;
        try {
            temp = req.body.temperature;
            hum = req.body.humidity;
            key = req.body.key;
        } catch (error) {
            prettyConsole.logError(`Error parsing data: ${error}`);
            return res.status(400).json({ error: 'Invalid data' });
        }
        // Check if all required data was provided
        if(temp === undefined || hum === undefined || key === undefined) {
            prettyConsole.logError('Temperature, Humidity or Key data is missing');
            return res.status(400).json({ error: 'All required properties were not recived' });
        }

        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify("Temperature: " + req.body.temperature + " Humidity: " + req.body.humidity));
        } else {
            prettyConsole.logError('Temperature or Humidity data is missing');
        }
        });
    res.status(200).json({ message: 'Data received' });
});



// Handle WebSocket connections
wss.on('connection', (socket: WebSocket, req) => {
    // Extract query parameters from the request URL
    const params = new URLSearchParams(req.url?.split('?')[1]);
    const client_type = params.get('client_type');

    // Attach the client type to the socket object
    (socket as any).client_type = client_type;

    // Log client type
    prettyConsole.logInfo(`Client connected: ${client_type}`);

    // Example: Sending a welcome message back to the client
    socket.send(`Welcome, ${client_type} client!`);

    // Listen for messages from the client
    socket.on('message', (message: string) => {
        prettyConsole.logInfo(`[Website WS Server] Received message from ${client_type}: ${message}`);

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                (client as any).client_type === 'client'
            ) {
                client.send(message);
            }
        });
    });

    // Handle WebSocket errors
    socket.on('error', (error) => {
        prettyConsole.logError(`WebSocket error for ${client_type}: ${error.message}`);
    });

    // Handle client disconnection
    socket.on('close', () => {
        prettyConsole.logInfo(`WebSocket connection closed for ${client_type}`);
    });
});


// -----------------------------------------------------------------------
// WebSocket server for embedded devices
// -----------------------------------------------------------------------

// Start the Express server
const server2 = app.listen(PORT2, () => {
    prettyConsole.logSuccess(`Started embedded devices server`);
});


// Example usage with wscat : wscat -c ws://localhost:3001?client_type=client
///NOTE:  clients who wish to receive broadcast messages need to specify the client_type query parameter as 'client'
const wss2 = new WebSocketServer({ server: server2 });
prettyConsole.logSuccess('WebSocket server 2 started');

app.post('/data2', async (req: any, res: any) => {
    let hatch: number;
    let fan: number;
    let pump: number;
    try {
        hatch = req.body.hatch;
        fan = req.body.fan;
        pump = req.body.pump;
    } catch (error) {
        prettyConsole.logError(`Error parsing data: ${error}`);
        return res.status(400).json({ error: 'Invalid data' });
    }
    // Check if all required data was provided
    if(hatch === undefined || fan === undefined || pump === undefined) {
        prettyConsole.logError('Hatch, Fan or Pump data is missing');
        return res.status(400).json({ error: 'All required properties were not recived' });
    }
    broadcast_values_to_clients(hatch, fan, pump);
    return res.status(200).json({ message: 'Data received' });
});

function broadcast_values_to_clients(hatch: number, fan: number, pump: number) {
    if (hatch > 255 || fan > 255 || pump > 255) {
        prettyConsole.logError('Values to large, max: 255');
        return;
    }
    if (hatch < 0 || fan < 0 || pump < 0) {
        prettyConsole.logError('Values must be positive');
        return;
    }

    const hatchBinary = hatch.toString(2).padStart(8, '0');
    const fanBinary = fan.toString(2).padStart(8, '0');
    const pumpBinary = pump.toString(2).padStart(8, '0');

    const combinedBinary = hatchBinary + fanBinary + pumpBinary;
    const combinedBinaryInt = parseInt(combinedBinary, 2);

    wss2.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && (client as any).client_type === 'client') {
            prettyConsole.logInfo(`Sending data to client: ${combinedBinaryInt}`);
            client.send(combinedBinaryInt);
        }
    });
}

wss2.on('connection', (socket: WebSocket, req) => {
    // Extract query parameters from the request URL
    const params = new URLSearchParams(req.url?.split('?')[1]);
    const client_type = params.get('client_type');

    // Attach the client type to the socket object
    (socket as any).client_type = client_type;

    // Log client type
    prettyConsole.logInfo(`Client connected: ${client_type}`);
    
    // Example: Sending a welcome message back to the client
    socket.send(`Welcome, ${client_type} client!`);

    // Listen for messages from the client
    socket.on('message', (message: string) => {
        prettyConsole.logInfo(`[Embedded WS Server] Received message from ${client_type}: ${message}`);

        // Broadcast the message to all connected clients
        wss2.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                (client as any).client_type === 'client'
            ) {
                client.send(message);
            }
        });
    });

    socket.on('error', (error) => {
        prettyConsole.logError(`WebSocket error for ${client_type}: ${error.message}`);
    });

    socket.on('close', () => {
        prettyConsole.logInfo(`WebSocket connection closed for ${client_type}`);
    });
});
