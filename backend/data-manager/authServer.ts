import { UserAuth } from './userAuth';
import PrettyConsole from '../generalUtils';
import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .dev.env file
dotenv.config({ path: '../../.dev.env' });

// Instantiate the userAuth and PrettyConsole classes
const userAuth = new UserAuth();
const prettyConsole = new PrettyConsole();

if (!process.env.PORT_AUTH) {
    prettyConsole.logWarning('PORT_AUTH environment variable is not set. Continuing with default value. Please set PORT_AUTH for to mitigate this warning.');
}

const app = express();
app.use(express.json());

// Allow requests from the frontend origin TODO: Add safe origin
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));




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

const PORT = process.env.PORT_AUTH || 3000;
app.listen(PORT, () => {
    prettyConsole.logSuccess(`Started auth server on port ${PORT}`);
});
