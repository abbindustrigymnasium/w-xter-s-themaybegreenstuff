// TODO: Implement database storage for users
import express, { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors'; // import cors package

interface User {
    id: string;
    email: string;
    username: string;
    password: string;
}

/**
 * A class that handles user authentication operations including registration and login.
 * 
 * @class UserAuth
 * @description Manages user authentication with JWT tokens and password hashing
 * @property {User[]} users - Private array storing registered users
 * @property {string} JWT_SECRET - Private readonly JWT secret key from environment variables
 * 
 * @example
 * const auth = new UserAuth();
 * // Use auth.register() for user registration
 * // Use auth.login() for user authentication
 * 
 * @remarks
 * - Uses bcrypt for password hashing
 * - Implements JWT for session management
 * - Stores users in memory (not suitable for production)
 * 
 * @see Related interfaces:
 * - User interface for user object structure
 * - Request and Response from Express
 */
class UserAuth {
    private users: User[] = [];
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    /**
     * Registers a new user in the system.
     * @param req - Express request object containing email and password in body
     * @param res - Express response object
     * @returns Promise<void>
     * @throws 400 if user already exists
     * @throws 500 if server error occurs
     */
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('req.body', req.body); // Debugging
            const { email, password, username } = req.body;
            console.log('email', email); // Debugging
            console.log('password', password); // Debugging
            if (this.users.find(user => user.email === email)) {
                res.status(400).json({ message: 'User already exists' });
                return;
            }

            console.log('Creating user...'); // Debugging
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser: User = {
                id: Date.now().toString(),
                email,
                username,
                password: hashedPassword
            };

            this.users.push(newUser);
            res.status(201).json({ message: 'User created successfully' });
            console.log("User created successfully"); // Debugging
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
    /**
     * Authenticates user login with email and password
     * @param req - Express Request object containing email and password in body
     * @param res - Express Response object
     * @returns Promise<void>
     * @throws 401 if credentials are invalid
     * @throws 500 if server error occurs
     */
    // TODO: implement possibility to login with username, not just email
    login = async (req: Request, res: Response): Promise<void> => {
        console.log('Existing users:', this.users); // Debugging
        try {
            console.log('req.body', req.body); // Debugging
            const { username, password } = req.body;
            console.log('email', username); // Debugging
            console.log('password', password); // Debugging
            
            if (!username || typeof username !== 'string') {
                console.log('Invalid username:', username); // Debugging
                res.status(400).json({ message: 'Invalid username format' });
                return;
            }
            
            const user = this.users.find(u => u.email === username);


            if (!user) {
                console.log('User not found:', username); // Debugging
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            console.log('User found:', user); // Debugging
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                console.log('Invalid password:', password);
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

            const token = jwt.sign({ userId: user.id }, this.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
}

// api server
const app = express();
app.use(express.json());
app.use(cors());

// api endpoints
const userAuth = new UserAuth();
app.post('/signup', userAuth.register as RequestHandler);
app.post('/login', userAuth.login as RequestHandler);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Debug: Environment variables:', {
        PORT: process.env.PORT,
        JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
    });
    console.log('Debug: Available endpoints:', [
        'POST /signup',
        'POST /login'
    ]);
});
