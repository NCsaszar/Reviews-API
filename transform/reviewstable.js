const fs = require('fs');
const csvParser = require('csv-parser');
const pool = require('../server/pgdb');
const path = require('path');
const through = require('through2');
const pgp = require('pg-promise')();

// const reviews = path.resolve(__dirname, '../csv/reviewsSample100000.csv');
const reviews = path.resolve(__dirname, '../csv/reviews.csv');
const insertStatement = `EXPLAIN INSERT INTO api.reviews (product_id, rating, createdat, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
let total = 0;

async function loadData(filePath) {
  let t1 = performance.now();
  let rows = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('error', (error) => {
        reject(error);
      })
      .pipe(
        through.obj(async (row, _, callback) => {
          rows.push({
            product_id: parseInt(row.product_id),
            rating: parseInt(row.rating),
            createdat: String(row.date),
            summary: String(row.summary),
            body: String(row.body),
            recommend: row.recommend === 'true' ? true : false,
            reported: row.reported === 'true' ? true : false,
            reviewer_name: String(row.reviewer_name),
            reviewer_email: String(row.reviewer_email),
            response: String(row.response),
            helpfulness: parseInt(row.helpfulness),
          });

          total += 1;
          if (rows.length >= 20000) {
            // Insert the data and clear the rows array
            await insertData(rows, reject);
            rows = [];
          }
          callback(null);
        })
      )
      .on('finish', async () => {
        // Insert any remaining data
        if (rows.length > 0) {
          await insertData(rows, reject);
        }

        console.log('Finished reading/parsing/loading CSV file');
        let t2 = performance.now();
        console.log(
          `ETL took ${(t2 - t1) / 1000 / 60} minutes to complete ${
            (t2 - t1) / 1000
          } seconds`
        );
        console.log(total + 'Rows inserted');
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function insertData(rows, reject) {
  const cs = new pgp.helpers.ColumnSet(
    [
      { name: 'product_id' },
      { name: 'rating' },
      { name: 'createdat' },
      { name: 'summary' },
      { name: 'body' },
      { name: 'recommend' },
      { name: 'reported' },
      { name: 'reviewer_name' },
      { name: 'reviewer_email' },
      { name: 'response' },
      { name: 'helpfulness' },
    ],
    { table: { table: 'reviews', schema: 'api' } }
  );

  try {
    await pool.query(pgp.helpers.insert(rows, cs));
  } catch (error) {
    reject(error);
  }
}

loadData(reviews);
