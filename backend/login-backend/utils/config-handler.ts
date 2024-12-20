import fs from 'fs';
import path from 'path';    
import toml from 'toml';

interface Config {
    database: {
        user: string;
        password: string;
        database_name: string;
    }
}


const rawData = fs.readFileSync(path.join(__dirname, '../../../project-params.toml'));
const config: Config = toml.parse(rawData.toString());


/**
 * Get the database parameters from the config file
 * @returns object containing the user and password
 */
export function getDatabaseParams(): { user: string; password: string; database_name: string } {
    return config.database;
}

console.log(config);