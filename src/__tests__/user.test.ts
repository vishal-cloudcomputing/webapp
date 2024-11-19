import request from 'supertest';
import app from '../app';
import User from '../model/user.Model';
import bcrypt from 'bcrypt';
import { connectDb } from '../config/database';
import mockSequelize  from '../config/mockdb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

jest.mock('../model/user.Model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  log: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  
}));

jest.mock('@aws-sdk/client-sns', () => {
  return {
    SNSClient: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
    PublishCommand: jest.fn(),
  };
});

describe('User Controller and Routes', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  let base64Credentials: string;

  beforeAll(async() => {
    base64Credentials = Buffer.from(`${testEmail}:${testPassword}`).toString('base64');
    await connectDb();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mockSequelize.close();
  });
  describe('POST /v1/user/', () => {
    it('should create a new user and return 201 status', async () => {
      const mockUser = {
        id: 1,
        email: 'testemail@example.com',
        first_name: 'John',
        last_name: 'Doe',
        account_created: new Date().toISOString(),
        account_updated: new Date().toISOString(),
      };
  
      const testEmail = 'testemail@example.com';
      const testPassword = 'password123';
  
      // Mock the methods
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
  
      // Set up environment variables for testing
      process.env.DOMIN_NAME = 'http://localhost:8081';
      process.env.SNS_TOPIC_ARN = 'mock-sns-topic-arn';
  
      // Make the POST request
      const response = await request(app)
        .post('/v1/user/')
        .send({
          email: testEmail,
          first_name: 'John',
          last_name: 'Doe',
          password: testPassword,
        });
  
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        account_created: expect.any(String),
        account_updated: expect.any(String),
      });
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('GET /v1/user/self', () => {
    it('should return user information with 200 status', async () => {
      const mockUser = {
        id: 1,
        email: testEmail,
        first_name: 'John',
        last_name: 'Doe',
        password: 'hashedPassword',
        account_created: new Date().toISOString(),
        account_updated: new Date().toISOString(),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .get('/v1/user/self')
        .set('Authorization', `Basic ${base64Credentials}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        account_created: expect.any(String),
        account_updated: expect.any(String),
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 if authentication fails', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: testEmail, password: 'hashedPassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .get('/v1/user/self')
        .set('Authorization', `Basic ${base64Credentials}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 401 if user is not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/v1/user/self')
        .set('Authorization', `Basic ${base64Credentials}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });
  });

  describe('PUT /v1/user/self', () => {
    it('should update user information and return 204 status', async () => {
      const updatedUserData = {
        first_name: 'Jane',
        last_name: 'Doe',
      };

      const mockUser = {
        id: 1,
        email: testEmail,
        password: 'hashedPassword',
        first_name: 'John',
        last_name: 'Doe',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (User.update as jest.Mock).mockResolvedValue([1]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .put('/v1/user/self')
        .send(updatedUserData)
        .set('Authorization', `Basic ${base64Credentials}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should return 400 if no valid fields are provided for update', async () => {
      const mockUser = {
        id: 1,
        email: testEmail,
        password: 'hashedPassword',
        first_name: 'John',
        last_name: 'Doe',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .put('/v1/user/self')
        .send({})
        .set('Authorization', `Basic ${base64Credentials}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'No valid fields to update' });
    });
    it('should return 400 if attempting to update account_updated field', async () => {
        const mockUser = {
          id: 1,
          email: testEmail,
          password: 'hashedPassword',
          first_name: 'John',
          last_name: 'Doe',
          account_updated: new Date()
        };
      
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
        const response = await request(app)
          .put('/v1/user/self')
          .send({ account_updated: new Date() })
          .set('Authorization', `Basic ${base64Credentials}`);
      
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid fields in the request' });
      });
      
    it('should return 401 if authentication fails', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: testEmail, password: 'hashedPassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .put('/v1/user/self')
        .send({ first_name: 'Jane' })
        .set('Authorization', `Basic ${base64Credentials}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });
  });
});