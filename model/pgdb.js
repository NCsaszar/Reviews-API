const { Pool } = require('pg');
const connectionString =
  'postgresql://postgres:9557@192.168.4.29:5432/postgres';
const pool = new Pool({
  connectionString: connectionString,
});

const validPost = (req) => {
  const bodyobj = req.body;
  const properties = [
    'product_id',
    'rating',
    'summary',
    'body',
    'recommend',
    'name',
    'email',
    'photos',
    'characteristics',
  ];

  for (const property of properties) {
    if (!bodyobj.hasOwnProperty(property)) {
      return false;
    }
  }

  return true;
};

const getReviews = async (params) => {
  const columns = [
    'r.review_id',
    'r.rating',
    'r.summary',
    'r.recommend',
    'r.response',
    'r.body',
    'r.date',
    'r.reviewer_name',
    'r.helpfulness',
  ];
  const query = `SELECT ${columns}, array_agg(json_build_object('id', p.id, 'url', p.url)) AS photos
FROM reviews r
LEFT JOIN photos p ON r.review_id = p.review_id
WHERE r.product_id = ${params.product_id} AND r.reported = false
GROUP BY r.review_id
LIMIT ${params.count}
`;
  let result;
  try {
    const client = await pool.connect();
    result = await client.query(query);
    client.release();
  } catch (error) {
    console.error(error);
  } finally {
    for (let i = 0; i < result.rows.length; i++) {
      let review = result.rows[i];
      let photos = review.photos;
      if (photos.length === 1) {
        if (photos[0].id === null) {
          result.rows[i].photos = [];
        }
      }
    }
    return result;
  }
};

const getRatings = async (product_id) => {
  let ratings;
  try {
    const client = await pool.connect();
    ratings = await client.query(
      `SELECT json_object_agg(rating::text, count::text) AS ratings FROM ratings WHERE product_id = ${product_id}`
    );
    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    return ratings.rows[0].ratings;
  }
};

const getRec = async (product_id) => {
  let result;
  try {
    const client = await pool.connect();
    result = await client.query(
      `SELECT json_build_object(recommend::text, COUNT(*)::text) as recc FROM reviews WHERE product_id = ${product_id} GROUP BY recommend`
    );
    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    let result1 = result.rows[0] ? result.rows[0].recc : null;
    let result2 = result.rows[1] ? result.rows[1].recc : null;
    let recc = { ...result1, ...result2 };
    return recc;
  }
};

const getCharacteristics = async (product_id) => {
  try {
    const client = await pool.connect();
    // Get the characteristics for the given product
    const characteristics = await client.query(
      `
      SELECT c.characteristic_id, c.name
      FROM chartable c
      WHERE c.product_id = ${product_id}
    `
    );
    // Initialize an empty object to store the results
    const results = {};
    // Loop through each characteristic
    for (const characteristic of characteristics.rows) {
      // Get the average value for the characteristic
      const averageValue = await client.query(
        `
        SELECT AVG(cr.value) as average_value
        FROM charrevtable cr
        WHERE cr.characteristic_id = ${characteristic.characteristic_id}
      `
      );
      // Add the characteristic data to the results object
      results[characteristic.name] = {
        id: characteristic.characteristic_id,
        value: averageValue.rows[0].average_value,
      };
    }
    client.release();
    // Return the results object
    return results;
  } catch (err) {
    console.error(err);
  }
};

const insertReview = async (review) => {
  const columns = [
    'product_id',
    'rating',
    'date',
    'summary',
    'body',
    'recommend',
    'reported',
    'reviewer_name',
    'reviewer_email',
    'response',
  ];
  const values = [
    review.product_id,
    review.rating,
    review.date,
    review.summary,
    review.body,
    review.recommend,
    false,
    review.reviewer_name,
    review.reviewer_email,
    'null',
  ];
  try {
    const client = await pool.connect();
    const res = await client.query(
      `INSERT INTO public.reviews (${columns.join(
        ', '
      )}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING review_id`,
      values
    );
    client.release();
    return res.rows[0].review_id;
  } catch (err) {
    console.log(err);
  }
};

const updateRatings = async (product_id, rating) => {
  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO public.ratings (product_id, rating, count) VALUES (${product_id},${rating},1)
      ON CONFLICT (product_id, rating) DO UPDATE SET count = ratings.count + 1`
    );
    client.release();
  } catch (err) {
    console.log(err);
  }
};

const insertPhotos = async (review_id, photos) => {
  console.log(review_id);
  const query = 'INSERT INTO public.photos (review_id, url) VALUES ($1, $2)';
  try {
    const client = await pool.connect();
    for (let i = 0; i < photos.length; i++) {
      const values = [review_id, photos[i]];
      await client.query(query, values);
    }
    client.release();
  } catch (error) {
    console.log(error);
  }
};

const updateChars = async (review_id, chars) => {
  const charIds = Object.keys(chars).map((char) => parseInt(char));
  const vals = Object.values(chars);

  const query = `INSERT INTO public.charrevtable (characteristic_id, review_id, value) VALUES ($1,$2,$3)`;
  try {
    const client = await pool.connect();
    for (let i = 0; i < charIds.length; i++) {
      let values = [charIds[i], review_id, vals[i]];
      await client.query(query, values);
    }
    client.release();
  } catch (error) {
    console.log(error);
  }
};

const postReview = async (review) => {
  const product_id = review.product_id;
  const rating = review.rating;
  const photos = review.photos;
  const characteristics = review.characteristics;
  try {
    const review_id = await insertReview(review);
    await updateRatings(product_id, rating);
    await insertPhotos(review_id, photos);
    await updateChars(review_id, characteristics);
  } catch (err) {
    console.log(err);
  }
};

const updateHelpful = async (review_id) => {
  try {
    const client = await pool.connect();
    await client.query(
      `UPDATE public.reviews SET helpfulness = helpfulness + 1 WHERE review_id = ${review_id}`
    );
    client.release();
  } catch (err) {
    console.log(err);
  }
};

const updateReported = async (review_id) => {
  try {
    const client = await pool.connect();
    await client.query(
      `UPDATE public.reviews SET reported = true WHERE review_id = ${review_id}`
    );
    client.release();
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  pool,
  getReviews,
  getRatings,
  getRec,
  getCharacteristics,
  validPost,
  postReview,
  updateHelpful,
  updateReported,
};
