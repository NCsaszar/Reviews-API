const fs = require('fs');
const csvParser = require('csv-parser');
const db = require('../pgdb');
const path = require('path');
const through = require('through2');
const pgp = require('pg-promise')();

// const reviews = path.resolve(__dirname, '../../csv/reviewsSample.csv');
// const reviews = path.resolve(__dirname, '../../csv/reviewsSample100000.csv');
const reviews = path.resolve(__dirname, '../../csv/reviews.csv');
let total = 0;

async function loadData(filePath) {
  await db.pool.query(`TRUNCATE reviews RESTART IDENTITY CASCADE`);
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
          const timestamp = row.date / 1000;
          const date = new Date(timestamp * 1000);
          const isoDate = date.toISOString();
          rows.push({
            product_id: parseInt(row.product_id),
            rating: parseInt(row.rating),
            date: isoDate,
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
            await insertData(rows, reject);
            rows = [];
          }
          callback(null);
        })
      )
      .on('finish', async () => {
        if (rows.length > 0) {
          await insertData(rows, reject);
        }
        resolve();
        let t2 = performance.now();
        console.log(
          `ETL took ${(t2 - t1) / 1000 / 60} minutes to complete ${
            (t2 - t1) / 1000
          } seconds`
        );
        console.log(total + ' Rows inserted');
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
      { name: 'date' },
      { name: 'summary' },
      { name: 'body' },
      { name: 'recommend' },
      { name: 'reported' },
      { name: 'reviewer_name' },
      { name: 'reviewer_email' },
      { name: 'response' },
      { name: 'helpfulness' },
    ],
    { table: { table: 'reviews', schema: 'public' } }
  );

  try {
    await db.pool.query(pgp.helpers.insert(rows, cs));
  } catch (error) {
    reject(error);
  }
}

loadData(reviews).then(() => {
  console.log(`Finished`);
});
