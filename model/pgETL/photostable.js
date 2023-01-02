const fs = require('fs');
const csvParser = require('csv-parser');
const db = require('../pgdb');
const path = require('path');
const through = require('through2');
const pgp = require('pg-promise')();

// const reviews = path.resolve(__dirname, '../../csv/reviewsPhotosSample.csv');
const reviews = path.resolve(__dirname, '../../csv/reviews_photos.csv');
let total = 0;

async function loadData(filePath) {
  await db.pool.query(`TRUNCATE photos RESTART IDENTITY CASCADE`);
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
            id: parseInt(row.id),
            review_id: parseInt(row.review_id),
            url: String(row.url),
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
    [{ name: 'review_id' }, { name: 'url' }],
    { table: { table: 'photos', schema: 'public' } }
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
