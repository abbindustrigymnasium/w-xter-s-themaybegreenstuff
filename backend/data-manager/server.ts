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

// TODO: Move away from using any type
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



// Start the Express server
const server = app.listen(PORT, () => {
    prettyConsole.logSuccess(`Started auth server`);
});






///NOTE:  clients who wish to receive broadcast messages need to specify the client_type query parameter as 'client'

// Start WebSocket server
const wss = new WebSocketServer({ server });

prettyConsole.logSuccess('WebSocket server started');

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
        prettyConsole.logInfo(`Received message from ${client_type}: ${message}`);

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
