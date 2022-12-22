const { Pool } = require('pg');
const pool = new Pool({
  user: 'root',
  host: 'localhost',
  database: 'reviewsapi',
  password: '1234',
  port: 5432,
});
module.exports = pool;
