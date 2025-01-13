import PrettyConsole from '../generalUtils';

import mariadb from 'mariadb';


/// @brief Database class to interact with the MariaDB database pool
class Database {
    private pool: mariadb.Pool;

    private prettyConsole = new PrettyConsole();

    private defParams = {
        user: 'default_user',
        host: 'localhost',
        database: 'waxteras',
        password: 'default_password',
        port: '3306', // Default MariaDB port
    };

    constructor() {
        // Warn if the paramerters are not set
        if (!process.env.DB_USER) {
            this.prettyConsole.logUnsafe('Database user is not set. For safe operation, the DB_USER should be specified. Continuing with default user.', this.defParams.user);
        }
        if (!process.env.DB_HOST) {
            this.prettyConsole.logUnsafe('Database host is not set. For safe operation, the DB_HOST should be specified. Continuing with default host.', this.defParams.host);
        }
        if (!process.env.DB_NAME) {
            this.prettyConsole.logUnsafe('Database name is not set. For safe operation, the DB_NAME should be specified. Continuing with default name.', this.defParams.database);
        }
        if (!process.env.DB_PASSWORD) {
            this.prettyConsole.logUnsafe('Database password is not set. For safe operation, the DB_PASSWORD should be specified. Continuing with default password.', this.defParams.password);
        }
        if (!process.env.DB_PORT) {
            this.prettyConsole.logUnsafe('Database port is not set. For safe operation, the DB_PORT should be specified. Continuing with default port.', this.defParams.port);
        }

        this.pool = mariadb.createPool({
            user: process.env.DB_USER || 'default_user',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'waxteras',
            password: process.env.DB_PASSWORD || 'default_password',
            port: parseInt(process.env.DB_PORT || '3306', 10), // Default MariaDB port
            connectionLimit: 10, // Increase the connection limit
            acquireTimeout: 10000 // Increase the acquire timeout
        });

        // Close the pool on application shutdown
        process.on('SIGINT', async () => {
            console.log('Closing database pool...');
            await this.pool.end();
            console.log('Database pool closed.');
            process.exit(0);
        });
    }

    // Close the pool when the instance is destroyed
    destroyed() {
        this.pool.end();
    }

    // Query function to interact with the database
    public async query(text: string, params?: any[]) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const result = await connection.query(text, params);
            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

export default Database;