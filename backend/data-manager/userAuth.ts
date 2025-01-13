import e from 'express';
import PrettyConsole from '../generalUtils';
import Database from './databases';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  username: string;
  id: number;
  permission_level: number;
  iat: number;
  exp: number;
  iss: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  permission_level: number;
  created_at: Date;
  updated_at: Date;
}

class UserAuth {
  private db: Database;
  private saltRounds: number;
  private jwtSecretKey: string;
  private prettyConsole = new PrettyConsole();

  constructor() {
    this.db = new Database();
    this.saltRounds = 10;

    if (!process.env.JWT_SECRET_KEY || process.env.JWT_SECRET_KEY === 'default_secret_key') {
      this.prettyConsole.logUnsafe(
        'JWT secret key is not set. Please set the JWT_SECRET_KEY environment variable.'
      );
    }

    this.jwtSecretKey = process.env.JWT_SECRET_KEY || 'default_secret_key';
  }

  async getAuthLevelFromJWT(token: string): Promise<number> {
    const decoded = await this.decodeAuthToken(token);
    if (!decoded) return -1;

    const user = await this.getUserByUsername(decoded.username);
    if (!user) return -1;

    return user.permission_level;
  }

  async getAuthToken(username: string, password: string): Promise<string | null> {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) {
        if (process.env.DEBUG) this.prettyConsole.logError('User not found');
        return null;
      }

      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        if (process.env.DEBUG) this.prettyConsole.logError('Invalid password');
        return null;
      }

      const payload = {
        username: user.username,
        id: user.id,
        permission_level: user.permission_level,
      };

      return this.generateAuthToken(payload);
    } catch (err) {
      this.prettyConsole.logError('Error during authentication', err);
      return null;
    }
  }

  private async generateAuthToken(payload: object): Promise<string> {
    const options = {
      expiresIn: '1h',
      issuer: 'backendAuthServer',
    };
    return jwt.sign(payload, this.jwtSecretKey, options);
  }

  async decodeAuthToken(token: string): Promise<DecodedToken | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecretKey) as DecodedToken;
      if (process.env.DEBUG) this.prettyConsole.logSuccess('Token decoded successfully');
      return decoded;
    } catch (err) {
      this.prettyConsole.logError('Error decoding token', err);
      return null;
    }
  }

  async generateUser(username: string, email: string, password: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    try {
      await this.db.query(
        'INSERT INTO users (username, email, password, permission_level) VALUES (?, ?, ?, 1);',
        [username, email, hashedPassword]
      );
      if (process.env.DEBUG) this.prettyConsole.logSuccess('User created successfully');
      return true;
    } catch (err) {
      this.prettyConsole.logError('Error creating user', err);
      return false;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await this.db.query('SELECT * FROM users WHERE username = ?;', [username]);
      if (result.length === 0) return null;
      return result[0];
    } catch (err) {
      if (process.env.DEBUG) this.prettyConsole.logError('Error fetching user', err);
      return null;
    }
  }
}

export { UserAuth };
