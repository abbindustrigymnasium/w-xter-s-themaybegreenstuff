const mariadb = require('mariadb');



// Create a new connection pool
const userTable = new mariadb.Table({
    username: 'VARCHAR(255) NOT NULL UNIQUE',
    password: 'VARCHAR(255) NOT NULL',
    email: 'VARCHAR(255) NOT NULL UNIQUE'
});

module.exports = mariadb.model('User', userTable);


