const request = require('supertest');
const app = require('../../src/app');
const connection = require('../../src/database/dbconnection');
require('../utils');

const mockOngCreate = () => {
  return {
    name: 'APAD',
    email: 'email@email.com',
    whatsapp: '11912345678',
    city: 'São Paulo',
    uf: 'SP',
  };
};

describe('ONG', () => {
  beforeEach(async () => {
    await connection.migrate.rollback();
    await connection.migrate.latest();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it('should be able to create a new ONG', async () => {
    const response = await request(app)
      .post('/ongs')
      .send(mockOngCreate())
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toHaveLength(8);
  });

  it('should throw an error for email validation', async () => {
    let createError = mockOngCreate();
    createError.email = 'error';

    const response = await request(app)
      .post('/ongs')
      .send(createError)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('validation.keys');
    expect(response.body.validation.keys[0]).toBe('email');
  });

  it("should list ONG's", async () => {
    const create = await request(app)
      .post('/ongs')
      .send(mockOngCreate())
      .expect('Content-Type', /json/)
      .expect(200);

    const response = await request(app)
      .get('/ongs')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeType('array');
    expect(response.body.length).toBe(1);
  });
});
