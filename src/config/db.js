const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host:               env.DB_HOST,
  port:               env.DB_PORT,
  database:           env.DB_NAME,
  user:               env.DB_USER,
  password:           env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit:    env.DB_POOL_MAX,
  queueLimit:         0,
  timezone:           '+00:00',
  charset:            'utf8mb4',
});

pool.on('connection', () => {
  // enforce UTC per connection
});

module.exports = pool;
