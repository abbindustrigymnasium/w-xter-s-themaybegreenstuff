/// @TODO: move the sensitive data in this file to a file incluede in a .gitignore asap

/*

Dependencies:
-   crypto: for generating random secret keys
-   mysql: for connecting to mariaDB
-   cors: for enabling cross-origin requests
-   axios: for making HTTP requests

-   ws: for websocket communication


*/

/* includes */
const crypto = require('crypto');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const secretKey = "key";


// mysql connection
const db = mysql.createPool({
    connectionLimit : 10,
    host :'localhost',
    user : 'fireproof',

    password : 'safepass',
    database : 'thermometer_project',
});


// allow requests from react
app.use(cors());
// parse json
app.use(express.json());

app.get('/data', (req, res) => {
    // Fetch data from MySQL
    const query = 'SELECT * FROM bufferTable ORDER BY id DESC LIMIT 10';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// pushing data
app.get('/push_data', (req, res) => {
    const { temp, hum, key } = req.query;
    console.log(temp, hum, key);

    if (!temp || !hum || !key) {
        return res.status(400).json({ status: 'error', message: 'Missing parameters' });
    }

    // Convert temp and hum to floats and sum them, then round to 2 decimal places
    const dataToHash = (parseFloat(temp) + parseFloat(hum)).toFixed(2); // Round to 2 decimal places
    console.log(dataToHash);

    // Calculate the HMAC
    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataToHash)  // Pass the string (rounded to 2 decimals)
        .digest('hex');

    // Compare the calculated HMAC with the provided key
    if (calculatedHash !== key) {
        return res.status(401).json({ status: 'error', message: 'Invalid HMAC' });
    }


    const query = 'INSERT INTO buffer_table (temperature, humidity) VALUES (?, ?)';
    db.query(query, [parseFloat(temp), parseFloat(hum)], (err, result) => {
        if (err) {
            console.error('Error inserting data', err);
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }

        // Send response after successful insertion
        res.json({ status: 'success', message: 'Data inserted', temp, hum });
    });
});




/**
 * @abstract Function to run the server at the specified port.
 */
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

