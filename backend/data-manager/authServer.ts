import { UserAuth } from './userAuth';
import PrettyConsole from '../generalUtils';
import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import ws from 'ws';

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




    // Create a WebSocket server
    const wss = new ws.Server({ server });

    prettyConsole.logSuccess('WebSocket server started');

    // Handle WebSocket connections
    wss.on('connection', (socket: ws.WebSocket) => {
        prettyConsole.logInfo('New WebSocket connection established');

        // Listen for messages from the client
        socket.on('message', (message: string) => {
            prettyConsole.logInfo(`Received message: ${message}`);

            // Example: Echo the message back to the client
            socket.send(`Echo: ${message}`);
        });

        // Handle WebSocket errors
        socket.on('error', (error) => {
            prettyConsole.logError(`WebSocket error: ${error.message}`);
        });

        // Handle client disconnection
        socket.on('close', () => {
            prettyConsole.logInfo('WebSocket connection closed');
        });
    });
