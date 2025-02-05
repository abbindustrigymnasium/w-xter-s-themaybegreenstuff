import PrettyConsole from '../generalUtils';
import mariadb from 'mariadb';

interface DatabaseParams {
    user?: string;
    host?: string;
    database?: string;
    password?: string;
    port?: string;
}

/// @brief Database class to interact with the MariaDB database pool
class Database {
    private pool: mariadb.Pool;

    private prettyConsole = new PrettyConsole();

    private defParams: DatabaseParams = {
        user: 'default_user',
        host: 'localhost',
        database: 'waxteras',
        password: 'default_password',
        port: '3306', // Default MariaDB port
    };

    constructor(customParams: DatabaseParams = {}) {
        const params = { ...this.defParams, ...customParams };

        // Warn if the parameters are not set
        if (!params.user) {
            this.prettyConsole.logUnsafe('Database user is not set. For safe operation, the DB_USER should be specified. Continuing with default user.', this.defParams.user);
        }
        if (!params.host) {
            this.prettyConsole.logUnsafe('Database host is not set. For safe operation, the DB_HOST should be specified. Continuing with default host.', this.defParams.host);
        }
        if (!params.database) {
            this.prettyConsole.logUnsafe('Database name is not set. For safe operation, the DB_NAME should be specified. Continuing with default name.', this.defParams.database);
        }
        if (!params.password) {
            this.prettyConsole.logUnsafe('Database password is not set. For safe operation, the DB_PASSWORD should be specified. Continuing with default password.', this.defParams.password);
        }
        if (!params.port) {
            this.prettyConsole.logUnsafe('Database port is not set. For safe operation, the DB_PORT should be specified. Continuing with default port.', this.defParams.port);
        }

        this.pool = mariadb.createPool({
            user: params.user,
            host: params.host,
            database: params.database,
            password: params.password,
            port: params.port ? parseInt(params.port, 10) : 3306, // Default MariaDB port
            connectionLimit: 10, // Increase the connection limit
            acquireTimeout: 10000 // Increase the acquire timeout
        });

        // Close the pool on application shutdown
        process.on('SIGINT', async () => {
            this.prettyConsole.logInfo('Closing database pool.');
            await this.pool.end();
            this.prettyConsole.logSuccess('Database pool closed, exiting.');
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