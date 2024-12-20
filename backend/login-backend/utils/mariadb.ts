import mariadb from 'mariadb';
import fs from 'fs';
import path from 'path';

// Read the config file
const configPath = path.resolve(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const { user, password, database_name } = config.database;

if (!user || !password || !database_name) {
    throw new Error('Database parameters not found in config file');
}

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || user,
    password: process.env.DB_PASSWORD || password,
    database: process.env.DB_NAME || database_name,
    connectionLimit: 5
});

export async function executeQuery<T>(query: string, params?: any[]): Promise<T> {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(query, params);
        return rows as T;
    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            conn.release();
        }
    }
}

export default pool;