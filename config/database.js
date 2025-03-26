const pgp = require('pg-promise')();

const connection = pgp({
    user: 'igonen',
    host: 'dev.vk.edu.ee',
    database: 'DB_Igonen',
    password: 't235166',
    searchPath: 'movies',
    port: 5432,
    })
    
module.exports = connection