/*
Welcome to the backend!

Imformation:
    - This is the entry point for the backend server.
    - Running this file with ts-node will run the backend servers.

Notes:
    - I am aware that the backend is NOT safe. 
    - I am also aware that the backend badly needs refactoring.
    - Considering 20% of production code isn't sql injection safe, this might just be acceptable. :>
*/



import { UserAuth } from './userAuth';
import PrettyConsole from '../generalUtils';
import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import WebSocketHandler from './webSocketHandler';

///////////////////////////////////////////////////////////////////////////////////////////////////
/// Env loading and server setup
///////////////////////////////////////////////////////////////////////////////////////////////////

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
const PORT = process.env.PORT_AUTH || 3001;
if (process.env.DEBUG) {
    prettyConsole.logInfo(`Backend is using port: ${PORT}`);
}

const PORT2 = process.env.PORT_EMB || 3000;
if (process.env.DEBUG) {
    prettyConsole.logInfo(`Backend is using port: ${PORT2} for embedded devices`);
}


///////////////////////////////////////////////////////////////////////////////////////////////////
/// Express server for handling authentication
///////////////////////////////////////////////////////////////////////////////////////////////////

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


app.post('/createUser', async (req: any, res: any) => {
    prettyConsole.logInfo('Creating user');
    const { username, email, password, authlevel } = req.body;
  
    if (!username || !email || !password || !authlevel) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const success = await userAuth.generateUser(username, email, password, authlevel);
        if (success) {
            return res.json({ message: 'User created successfully' });
        } else {
            return res.status(500).json({ error: 'Internal server error' });
        }
    } catch (error) {
        prettyConsole.logError(`Error creating user: ${error}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


///////////////////////////////////////////////////////////////////////////////////////////////////
/// Websocket for various communication requirements
///////////////////////////////////////////////////////////////////////////////////////////////////


const wsh = new WebSocketHandler(Number(PORT2));
if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET environment variable is not set');
}
wsh.JWTSecretKey = process.env.JWT_SECRET_KEY || 'default_secret_key';
wsh.initialize();


