const request = require('supertest-as-promised');
const app = require('./server');

describe('GET /reviews/', () => {
  it('should return a list of reviews', async () => {
    const response = await request(app)
      .get('/reviews/')
      .query({ product_id: 100, count: 5 })
      .expect(200)
      .expect('Content-Type', /json/);
    expect(response.body).toBeInstanceOf(Object);
  });
});

describe('GET /reviews/meta', () => {
  it('should return meta data', async () => {
    const response = await request(app)
      .get('/reviews/')
      .query({ product_id: 100 })
      .expect(200)
      .expect('Content-Type', /json/);
    expect(response.body).toBeInstanceOf(Object);
  });
});
