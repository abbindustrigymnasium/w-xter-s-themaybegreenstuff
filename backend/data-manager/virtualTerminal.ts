import { log } from 'console';
import { UserAuth } from './userAuth';

type TempLogItem = {
    timestamp: number;
    user: string | null;
    command: string | null;
};

const systemResponse = {
    errorGeneric: 'Invalid command.',
    errorUnauthorizedGeneric: 'Unauthorized, requires elevated privileges.',
};

class VirtualTerminalBackend {
    private userAuthLevel: number = -1;
    private user: string = '';

    // Log item structure: [timestamp, user, command]
    public tempLog: TempLogItem[] = [];

    // Constructor to initialize user and authentication level
    constructor(user: string, userAuthLevel: number) {
        this.user = user;
        this.userAuthLevel = userAuthLevel;
    }

    // Retrieve users with password censoring unless overridden by an authorized user
    private getUsers(overridePwdCensor: boolean): any {
        if (overridePwdCensor && this.userAuthLevel < 5) {
            console.error('Unauthorized access to uncensored passwords.');
            return null;
        }
        //return getUsers(overridePwdCensor);
    }
    private genericError: string = 'Invalid command.';

    // Log a command, public only for testing
    /// TODO: Restrict access once testing is complete
    public logCommand(user: string, command: string): void {
        if (command.length > 255) {
            console.warn(systemResponse.errorGeneric);
            this.logCommand('SYSTEM', systemResponse.errorGeneric);
            return;
        }

        const logItem: TempLogItem = {
            timestamp: Date.now(),
            user,
            command,
        };

        // guard against loggin null or undefined commands / users
        if (logItem.user === null || logItem.command === undefined) {
            if(process.env.DEBUG) {
                console.error('Invalid log item:', logItem);
            }
            this.logCommand('SYSTEM', this.genericError);
        }

        if(process.env.DEBUG) {
        console.log('Logging command:', logItem);
        }

        this.tempLog.push(logItem);
    }

    // Parse a command into an array of lowercase words
    public parseCommand(command: string): string[] {
        const lowerCommand = command.toLowerCase();
        const words = lowerCommand.split(' ');

        if(process.env.DEBUG){
            console.log('Parsed command:', words);
        }
        this.logCommand(this.user, command);
        return words;
    }

    
}

export default VirtualTerminalBackend;

// Example usage
const vtb = new VirtualTerminalBackend('admin', 5);
vtb.parseCommand('SELECT * FROM users');
vtb.logCommand('admin', 'SELECT user FROM users');

console.log(vtb.tempLog);