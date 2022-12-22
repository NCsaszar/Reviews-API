const pool = require('./pgdb');

// viewTables().then(() => pool.end());
// createSchema().then(() => pool.end());
// createTables().then(() => pool.end());
// viewDataTypes().then(() => pool.end());

async function viewDataTypes() {
  try {
    const result = await pool.query(`
  SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews' AND table_schema = 'api'
`);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}

async function viewTables() {
  try {
    const result = await pool.query(`
  SELECT * FROM information_schema.tables WHERE table_schema = 'api'
`);
    const tableNames = result.rows.map((row) => row.table_name);
    console.log(tableNames);
  } catch (error) {
    console.log(error);
  }
}

async function createSchema() {
  try {
    const results = await pool.query('CREATE SCHEMA IF NOT EXISTS api');
    console.log(results);
  } catch (error) {
    console.log(error);
  }
}

async function createTables() {
  try {
    await pool.query(`
    CREATE TABLE api.reviews (
      id SERIAL PRIMARY KEY,
      product_id INT NOT NULL,
      rating SMALLINT,
      createdAt DATE,
      summary TEXT,
      body TEXT,
      recommend BOOLEAN,
      reported BOOLEAN,
      reviewer_name TEXT,
      reviewer_email TEXT,
      response TEXT,
      helpfulness INT
      )
      `);
    await pool.query(`
      CREATE TABLE api.photos (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL,
        url TEXT,
        FOREIGN KEY (review_id) REFERENCES reviews (id)
        )
        `);
    await pool.query(`
        CREATE TABLE api.ratings (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        one INT,
        two INT,
        three INT,
        four INT,
        five INT
        )
        `);
    await pool.query(`
        CREATE TABLE api.recommend (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        good INT,
        bad INT
        )
        `);
    await pool.query(`
        CREATE TABLE api.characs (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        name VARCHAR(15)
        )
        `);
    await pool.query(`
        CREATE TABLE api.characsrev (
        id SERIAL PRIMARY KEY,
        characs_id INT NOT NULL,
        value SMALLINT,
        FOREIGN KEY (characs_id) REFERENCES characs (id)
        )
        `);
  } catch (error) {
    console.log(error);
  }
}
