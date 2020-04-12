const request = require('supertest');
const app = require('../../src/app');
const connection = require('../../src/database/dbconnection');
require('../utils');

const mockIncidentCreate = () => {
  return {
    title: 'Incident Title',
    description: 'Desciption',
    value: 100,
  };
};

const mockOngCreate = () => {
  return {
    name: 'APAD',
    email: 'email@email.com',
    whatsapp: '11912345678',
    city: 'São Paulo',
    uf: 'SP',
  };
};

describe('INCIDENT', () => {
  beforeEach(async () => {
    await connection.migrate.rollback();
    await connection.migrate.latest();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it('should be able to create a new Incidents', async () => {
    const response = await request(app)
      .post('/incidents')
      .set('Authorization', 'aa50a4eb')
      .send(mockIncidentCreate())
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBeType('number');
  });

  it('should throw an error for number validation', async () => {
    let createError = mockIncidentCreate();
    createError.value = 'error';

    const response = await request(app)
      .post('/incidents')
      .set('Authorization', 'aa50a4eb')
      .send(createError)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('validation.keys');
    expect(response.body.validation.keys[0]).toBe('value');
  });

  it('should list Incidents', async () => {
    const createOng = await request(app)
      .post('/ongs')
      .send(mockOngCreate())
      .expect('Content-Type', /json/)
      .expect(200);

    const create = await request(app)
      .post('/incidents')
      .set('Authorization', createOng.body.id)
      .send(mockIncidentCreate())
      .expect('Content-Type', /json/)
      .expect(200);

    const response = await request(app)
      .get('/incidents')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeType('array');
    expect(response.body.length).toBe(1);
  });
});
