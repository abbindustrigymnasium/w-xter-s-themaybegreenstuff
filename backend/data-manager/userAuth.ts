import PrettyConsole from '../generalUtils';
import Database from './databases';
import * as bcrypt from 'bcrypt';
const jwt = require('jsonwebtoken');

class UserAuth {
  private db: Database;
  private saltRounds: number;
  private jwtSecretKey: string;
  private prettyConsole = new PrettyConsole();

  constructor() {
    this.db = new Database();
    this.saltRounds = 10; // Number of rounds to process the data for
    

    // Warn if the JWT secret key is not set
    if (!process.env.JWT_SECRET_KEY || process.env.JWT_SECRET_KEY === 'default_secret_key') {
      this.prettyConsole.logUnsafe('JWT secret key is not set. Please set the JWT_SECRET_KEY environment variable.');
    }
    this.jwtSecretKey = process.env.JWT_SECRET_KEY || 'default_secret_key'; // Replace 'default_secret_key' with an actual default key if needed
  }

  

  async getAuthToken(username: string, password: string): Promise<string | null> {
    try {
      // Fetch the user's hashed password from the database using the provided username
      const result = await this.db.query('SELECT password FROM users WHERE username = ?;', [username]);
  
      if (result.length === 0) {
        // If no user is found, return null to indicate authentication failure
        if(process.env.DEBUG) {
          console.error('User not found');
        }
          return null;
      }
  
      const hashedPassword = result[0].password;
  
      // Verify the provided password against the stored hashed password
      const isPasswordValid = await this.verifyPassword(password, hashedPassword);
  
      if (!isPasswordValid) {
        // If the password is invalid, return null to indicate authentication failure
        if (process.env.DEBUG) {
          console.error('Invalid password');
        }
        return null;
      }
  
      // Generate an authentication token if the password is valid
      // You can use any token generation library (e.g., `jsonwebtoken`) here
      const token = await this.generateAuthToken(username);
      if(process.env.DEBUG) {
        console.log('Authentication successful, token generated');
      }
      return token;
    } catch (err) {
      this.prettyConsole.logError('Error during authentication', err);
      return null;
    }
  }
  
  private async generateAuthToken(username: string): Promise<string> {
    // Generate a new JWT token with the provided username
    const token = jwt.sign({ username }, this.jwtSecretKey, { expiresIn: '1h' });
    return token;
  }
  

  /// This function will attempt to create a new user in the database
  /// @param username The username of the new user
  /// @param email The email of the new user
  /// @param password The password of the new user
  async generateUser(username: string, email: string, password: string): Promise<boolean> {
    // Hash the password before storing it in the database
    const hashedPassword = await this.hashPassword(password);
    try {
      // Insert the new user into the database
      await this.db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?);', [username, email, hashedPassword]);
      if(process.env.DEBUG) {
        this.prettyConsole.logSuccess('User created successfully');
      }
      return true;
    } catch (err) {
      this.prettyConsole.logError('Error creating user', err);
      return false;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    return hashedPassword;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  }

  /// TODO: Likely remove this function? Maybe?
  async getUsers() {
    try {
      const res = await this.db.query('SELECT * FROM users;');
      console.log(res); // Output the query results
    } catch (err) {
      this.prettyConsole.logError('Error fetching users', err);
    }
  }

  
}
export { UserAuth };