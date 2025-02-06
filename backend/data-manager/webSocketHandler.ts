//Documentation

// Sending data to embedded_device
// Message requires the following format:
// [hatch, fan, pump]
// Each value is an unsigned integer between 0 and 255 (type is not enforced)


import WebSocket, {WebSocketServer} from 'ws';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { URL } from 'url';
import os from 'os';
import jwt from 'jsonwebtoken';
import Database from './databases';
import dotenv from 'dotenv';


// Load environment variables from .env file
dotenv.config({ path: '../../.dev.env' });

let PrettyConsole: any; ///< PrettyConsole class for logging
/**
 * @brief Load the PrettyConsole class
 * @note If the class is not found, a fallback class will be used
 */
async function loadPrettyConsole(): Promise<any> {
    try {
        PrettyConsole = (await import('../generalUtils')).default;
    } catch (error) {
        // Define the PrettyConsole class as a fallback
        console.log('\x1b[31mError\x1b[0m unable to load PrettyConsole class, using fallback (it is recommended to fix this error)');
        PrettyConsole = class {
            private colors = {
                reset: '\x1b[0m',
                warning: '\x1b[33m',
                error: '\x1b[31m',
                success: '\x1b[32m',
                separator: '\x1b[36m',
                info: '\x1b[34m',
            };

            private separator = '--------------------------';

            private formatMessage(label: string, labelColor: string, message: string): string {
                return `${labelColor}${label}:${this.colors.reset} ${message}`;
            }

            public logWarning(message: string, details?: any): void {
                console.log(this.formatMessage('Warning', this.colors.warning, message));
                if (details) {
                    console.log(`${this.colors.separator}${this.separator}${this.colors.reset}`);
                    console.log(details);
                    console.log(`${this.colors.separator}${this.separator}${this.colors.reset}\n`);
                }
            }

            public logUnsafe(message: string, details?: any): void {
                console.log(this.formatMessage('Unsafe', this.colors.error, message));
                if (details) {
                    console.log(`${this.colors.separator}${this.separator}${this.colors.reset}`);
                    console.log(details);
                    console.log(`${this.colors.separator}${this.separator}${this.colors.reset}\n`);
                }
            }

            public logError(message: string, details?: any): void {
                console.error(this.formatMessage('Error', this.colors.error, message));
                if (details) {
                    console.error(`${this.colors.separator}${this.separator}${this.colors.reset}`);
                    console.error(details.stack || details.message || details);
                    console.error(`${this.colors.separator}${this.separator}${this.colors.reset}\n`);
                }
            }

            public logSuccess(message: string, details?: any): void {
                console.log(this.formatMessage('Success', this.colors.success, message));
                if (details) {
                    console.log(`${this.colors.separator}${this.separator}${this.colors.reset}`);
                    console.log(details);
                    console.log(`${this.colors.separator}${this.separator}${this.colors.reset}\n`);
                }
            }

            public logInfo(message: string): void {
                console.log(this.formatMessage('Info', this.colors.info, message));
            }
        };
    }

    // Create a new PrettyConsole instance
    const prettyConsole = new PrettyConsole();
    return prettyConsole;
}

class WSH_DebugHelper {
    // --------------------- Useful Debugging Information --------------------
    public Hostname: string = os.hostname();                                ///< Hostname of the server
    public LocalIpAddress: string; ///< Local IP address of the server


    constructor() {

        const interfaces = os.networkInterfaces();
        let localIp = 'undefined';
        
        // Find the first non-internal IPv4 address
        for (const name in interfaces) {
            const iface = interfaces[name];
            if (!iface) continue;
    
            for (const address of iface) {
                if (address.family === 'IPv4' && !address.internal) {
                    localIp = address.address;
                    break;
                }
            }
        }
    
        this.LocalIpAddress = localIp;
    }
    
    
}



// -----------------------------------------------------------------------
// WebSocketHandler
// -----------------------------------------------------------------------                                           
const app = express();                                                                ///< Create a new express app

interface client extends WebSocket {                                                  
    uuid: string;                                                                     ///< Add a uuid to the Websocket
    client_type: typeof client_types[number];                                         ///< Add a client type to the Websocket
}

const client_types = [                                                                ///< Types of clients that can connect to the server
    'web_client', 
    'embedded_device', 
    'console_client',
    'graph_component', ///< This works in mysterious ways
    'val_database'     ///< This is not a real client, but is used to store the values in the database
] as const;

/**
 * @brief WebSocketHandler class to handle WebSocket connections
 * @warning Make sure to set the JWTSecretKey to a secure value before deploying
 */
class WebSocketHandler {
    // -------------------------- Get prettyConsole --------------------------
    private prettyConsole: any;                                                       ///< PrettyConsole class for logging
    // ----------------------- Create Database Instance ----------------------
    private db = new Database();                                                      ///< Database instance for storing and retriving temp and humidity values
    // ------------------------ Settable Class Params ------------------------
    public ErrorIfValueOutOfRange: boolean = true;                                    ///< If true, the class will throw an error if a value is out of range, instead of clamping it to the nearest value
    public JWTSecretKey: string = 'your_secret_key';                                  ///< Secret key for JWT token generation (MAKE SURE TO SET THIS TO A SECURE VALUE)
    private port: number;                                                             ///< Port for the WebSocket , set using the constructor
    // ---------------------------- Server -> OUT  ---------------------------
    private lastMessages = new Map<typeof client_types[number], string>               ///< Last message sent to each client type
    private th_cache: any[] = [];                                                     ///< Cache for temperature and humidity values [date, temp, hum]   
    // ---------- OUT -> Server (These get stored in a mysql table) ----------
    private temp_newest: number = -1;                                                 ///< Newest temperature value
    private hum_newest: number = 1;                                                   ///< Newest humidity value

    // ------------------------------ Websocket ------------------------------
    private clients = new Map<typeof client_types[number], Map<string, client>>();    ///< Map of clients connected to the server
    
    private DEBUG: boolean = false;                                                   ///< Debug mode flag (simplifies since we don't have to check process.env.DEBUG every time)                                                  ///< WebSocket server instance 
    private wss!: WebSocketServer;                                                    ///< WebSocket server, set in the initialize function, thus ignoring the undefined error is safe
    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------

    
    constructor(port: number = 3000) {
        this.DEBUG = process.env.DEBUG === 'true';
        this.port = port;
    }
    public async initialize() {
        // Initialize maps to avoid undefined errors
        client_types.forEach(type => {
            this.clients.set(type, new Map<string, client>()); ///< Initialize the clients map for each client type
            this.lastMessages.set(type, ''); ///< Initialize the last message to an empty string
        });

        // Load PrettyConsole
        await loadPrettyConsole().then(prettyConsole => {
            this.prettyConsole = prettyConsole;
        });
        
        // Cache the days temperature and humidity values
        this.th_cache = await this.db.query(`SELECT * FROM temp_hum WHERE DATE(created_at) = CURDATE() ORDER BY id;`);
        this.prettyConsole.logInfo(`Loaded ${this.th_cache.length} values into the cache`);

        // start an express server
        const server = app.listen(this.port, () => {
            this.DEBUG && this.prettyConsole.logSuccess(`Started embedded devices Express server`);
        })

        

        // start a websocket server on the express server
        this.wss = new WebSocketServer({ server });

        // ---------------------- Set up WSS Event Handling ----------------------
        this.wss.on('connection', (socket: client, req:any) => {
            // Log the connection
            this.DEBUG && this.prettyConsole.logInfo('New connection');
            this.appendClient(socket, req);

            // Handle messages
            // NOTE : Make sure the data is sent from a client with a valid user type (clients that have valid user types have been authenticated before this point)
            socket.on('message', (data: WebSocket.Data) => {
                // Log the message
                this.DEBUG && this.prettyConsole.logInfo(`Received message: ${data}`);

                this.handleClientMessage(socket, data); ///< Handle the message
            });

            // Handle errors
            socket.on('error', (error: Error) => {
                // Log the error
                this.DEBUG && this.prettyConsole.logError('Error in WebSocket connection', error);
            });

            // Handle closing
            socket.on('close', () => {
                // Log the closing
                this.DEBUG && this.prettyConsole.logInfo('Connection closed');
                
                // Remove the client from the clients map
                this.clients.get(socket.client_type)?.delete(socket.uuid);
                
            });
        });
        

        // ------------------------------- If Debug ------------------------------
        if (!this.DEBUG) return;
        // Instantiate the debug helper
        const wsh_debug = new WSH_DebugHelper();
        // Log the server address
        

        // Log the ws server address
        this.wss.on('listening', () => {
            this.prettyConsole.logSuccess(`WebSocket is listening on address:`)
            this.prettyConsole.logInfo(`ws://${wsh_debug.Hostname}:${this.port}`);
            this.prettyConsole.logInfo(`ws://${wsh_debug.LocalIpAddress}:${this.port}`);
        });
    }


    /**
     * @brief Broadcasts a message to all clients of a specified type
     * @param clientType The type of client to broadcast the message to
     * @param message The message to broadcast
     */
    private async broadCastToClientType(clientType: typeof client_types[number], message: string) : Promise<void> {
        console.log(message);
        // Get the clients map for the specified client type
        // TODO: Optimize
        const clientsMap = this.clients.get(clientType);
        if (clientsMap) {
            clientsMap.forEach((client: client) => {
            client.send(message.toString());
            });
        }
    }


    /**
     * @brief Handle a message from a client
     * @param socket The WebSocket client that sent the message
     * @param data The data sent by the client
     * @note The data is expected to be in the following format:
     * @example Valid example message: 
     * {"msg": "<example message>","forward_to" : [<list of client types to forward to, ex: console_client>]}
     * 
     */
    private async handleClientMessage(socket: client, data: WebSocket.Data) : Promise<void> {
        let formattedJson: any;
        try {
            // Extract the JSON-like part from the message
            const match = data.toString().match(/{.*}/);
            if (!match) {
              throw new Error("No JSON-like object found in the input");
            }
        
            // add quotes where necessary
            formattedJson = match[0].replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
        
           
        } catch (error) {
            this.DEBUG && this.prettyConsole.logError("Error parsing JSON-like object", error);
            return;
        }

        // Attempt to get keys: msg, forward_to from the parsed_json object

        const { msg, forward_to } = JSON.parse(formattedJson);
        this.DEBUG && this.prettyConsole.logInfo(`Parsed JSON-like object: ${JSON.stringify(formattedJson)}`);
        if (!msg || !forward_to) {
            this.DEBUG && this.prettyConsole.logError('Invalid message format');
            return;
        }

        const client_uuid = socket.uuid;

        // Log the message
        this.DEBUG && this.prettyConsole.logInfo(`Received message from client ${client_uuid}: ${msg} - Special forwarding to: ${forward_to}`);

        // Forward the message to the specified client(s)
        forward_to.forEach(async (clientType: typeof client_types[number]) => {
            // Special case for the val_database client type (store the values in the database) and broadcast to graph_component
            if (clientType === 'val_database') {
                try {
                    const [temp, hum] = msg.toString().split(',').map(Number);
                    if (isNaN(temp) || isNaN(hum)) {
                        throw new Error('Invalid temperature or humidity values');
                    }
                    this.prettyConsole.logInfo(`Temp: ${temp}, Hum: ${hum}`);
                    // This is not optimal, since it makes unnecessary queries to the database (i.e. unnecessary operations to the hard drive)
                    this.db.query(`INSERT INTO ${process.env.TEMPHUM_DB_NAME} (temp, hum) VALUES (?, ?)`, [temp, hum]);
                    const new_instance = await this.db.query(`SELECT * FROM ${process.env.TEMPHUM_DB_NAME} ORDER BY id DESC LIMIT 1`);
                    this.th_cache.push(new_instance);
                    // Broadcast the new values to the graph component
                    this.broadCastToClientType('graph_component', JSON.stringify(new_instance));
                    this.DEBUG && this.prettyConsole.logSuccess('Stored values in the database and broadcasted to graph component');
                }
                catch {
                    this.prettyConsole.logError('Error storing values in the database');
                }
            }
            // Make sure the message is not a duplicate
            else if (msg!.toString() !== this.lastMessages.get(clientType)!.toString()) {
                this.broadCastToClientType(clientType, msg);
                this.DEBUG && this.prettyConsole.logInfo(`Forwarding message to: ${clientType}`);

                this.lastMessages.set(clientType, msg.toString()); ///< Update the last message
            // Ignore duplicate messages (in most cases)
            } else {
                this.DEBUG && this.prettyConsole.logInfo(`Not forwarding message to: ${clientType} - Message is the same as the last message`);
            }
        });
    }
        
    private async appendClient(socket: client, req: any) {
        // Get user query parameters to determine the type of user, and determine if the user is authorized
        const query = new URL(req.url, `http://${req.headers.host}`).searchParams;
        const userType = query.get('type'); // get the ?type= query parameter 
        
        // Check if the user type is valid
        if (!userType || !client_types.includes(userType as any)) {
            this.DEBUG && this.prettyConsole.logError(`Invalid user type: ${userType} - Ignoring connection`);
            return;
        }

        // Generate a uuid for the client
        const client_uuid = uuidv4();
        this.DEBUG && this.prettyConsole.logInfo(`New user of type ${userType} connected, assigned uuid: ${client_uuid}`);

        // These are required for removing the client from the clients map when the connection is closed
        socket.uuid = client_uuid;              ///< Assign the uuid to the socket
        socket.client_type = userType as any;   ///< Assign the user type to the socket
    
        // Add the client to the list of clients
        this.clients.get(userType as any)!.set(client_uuid, socket);

        // ------------------------------ Edge Cases -----------------------------
        // Send the last message clients
        if (this.lastMessages.get(userType as typeof client_types[number]) != '') {
            this.prettyConsole.logInfo(`Sending last message to embedded device: ${this.lastMessages.get(userType as typeof client_types[number])}`);
            socket.send(this.lastMessages.get(userType as typeof client_types[number])!);
        }

        // Send the cache to graph components
        if (userType === 'graph_component') {
            this.prettyConsole.logInfo(`Sending cache to graph component`);
            socket.send(JSON.stringify(this.th_cache));
        }
    }        
}

export default WebSocketHandler;