const express = require('express');
const db = require('../model/pgdb');
const app = express();
const bodyParser = require('body-parser');
// require('dotenv').config();
// const tracing = require('./tracing');

/*Middle-Ware*/
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

/*
Defined Routes below
*/

app.get('/reviews/', async (req, res) => {
  const q = req.query;
  const product_id = parseInt(q.product_id) ? parseInt(q.product_id) : null;
  let count = parseInt(q.count) ? parseInt(q.count) : 5;
  let sort = q.sort || 'newest';
  let page = parseInt(q.page) ? parseInt(q.page) : 1;
  let params = { product_id, count, sort, page };
  if (product_id) {
    try {
      const results = await db.getReviews(params);
      let reviews = {
        product: product_id,
        page: page,
        count: count,
        results: results.rows,
      };
      res.status(200).send(reviews);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: err });
    }
  } else {
    res.status(422).send({ error: 'Error with query' });
  }
});

app.get('/reviews/meta', async (req, res) => {
  const product_id =
    !req.query.product_id || isNaN(req.query.product_id)
      ? res.status(422).send('Error with query params')
      : req.query.product_id;

  try {
    const ratings = await db.getRatings(product_id);
    const recommend = await db.getRec(product_id);
    const characteristics = await db.getCharacteristics(product_id);
    let meta = {
      product_id: product_id,
      ratings: ratings,
      recommended: recommend,
      characteristics: characteristics,
    };
    res.status(200).send(meta);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.post('/reviews', async (req, res) => {
  let valid = db.validPost(req);
  let reqbody = req.body;
  const date = new Date();
  const isoDate = date.toISOString();

  if (valid) {
    let review = {
      product_id: reqbody.product_id,
      rating: reqbody.rating,
      date: isoDate,
      summary: reqbody.summary,
      body: reqbody.body,
      recommend: reqbody.recommend,
      reviewer_name: reqbody.name,
      reviewer_email: reqbody.email,
      photos: reqbody.photos,
      characteristics: reqbody.characteristics,
    };
    try {
      await db.postReview(review);
      res.status(201).send({ response: 'Post sent!' });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: 'Bad request structure' });
    }
  }
});

app.put('/reviews/:review_id/helpful', async (req, res) => {
  const review_id = req.params.review_id;
  try {
    await db.updateHelpful(review_id);
    res.status(204).end();
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.put('/reviews/:review_id/report', async (req, res) => {
  const review_id = req.params.review_id;
  try {
    await db.updateReported(review_id);
    res.status(204).end();
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.listen(3000, () => {
  console.log('Server started and listening on port: ', 3000);
});

module.exports = app;
