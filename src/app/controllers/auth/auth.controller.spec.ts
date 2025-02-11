import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { testApplication } from '../../../../test/test-app';
import { UserRole } from '../../domains/user/user.interface';
import { UsersService } from '../../domains/user/user.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeAll(async () => {
    app = await testApplication();
    await app.init();

    usersService = app.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/signup', () => {
    const signupEndpoint = '/auth/signup';
    const validSignupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.USER,
    };

    it('should create a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(signupEndpoint)
        .send(validSignupData)
        .expect(201);

      // Check response structure
      expect(response.body).toEqual({
        id: expect.any(String),
        name: validSignupData.name,
        email: validSignupData.email,
        role: validSignupData.role,
        token: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Verify user was actually created in database
      const user = await usersService.findUserByEmail(validSignupData.email);
      expect(user).toBeDefined();
      expect(user.name).toBe(validSignupData.name);
      expect(user.email).toBe(validSignupData.email);
      expect(user.role).toBe(validSignupData.role);
    });

    it('should return 409 when email already exists', async () => {
      const newUser = {
        ...validSignupData,
        email: 'newtest@gmail.com',
      };
      // First create a user
      await request(app.getHttpServer())
        .post(signupEndpoint)
        .send(newUser)
        .expect(201);

      // Try to create another user with same email
      const response = await request(app.getHttpServer())
        .post(signupEndpoint)
        .send(newUser)
        .expect(409);

      expect(response.body.message).toBe(
        `Email ${newUser.email} is already in use`,
      );
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post(signupEndpoint)
        .send({})
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'Name must be a string',
          'Please provide a valid email address',
          'Password must be between 4 and 20 characters',
          'Role must be either admin or user',
        ]),
      );
    });

    it('should validate password length', async () => {
      const invalidData = {
        ...validSignupData,
        password: '123', // too short
      };

      const response = await request(app.getHttpServer())
        .post(signupEndpoint)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'Password must be between 4 and 20 characters',
        ]),
      );
    });

    it('should validate email format', async () => {
      const invalidData = {
        ...validSignupData,
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .post(signupEndpoint)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining(['Please provide a valid email address']),
      );
    });

    it('should validate role enum values', async () => {
      const invalidData = {
        ...validSignupData,
        role: 'invalid-role',
      };

      const response = await request(app.getHttpServer())
        .post(signupEndpoint)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining(['Role must be either admin or user']),
      );
    });
  });

  describe('POST /auth/signin', () => {
    const signinEndpoint = '/auth/signin';
    const validSignupData = {
      name: 'Test User',
      email: 'signin-test@example.com',
      password: 'password123',
      role: UserRole.USER,
    };

    beforeEach(async () => {
      // Create a user for signin tests
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(validSignupData);
    });

    it('should sign in successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post(signinEndpoint)
        .send({
          email: validSignupData.email,
          password: validSignupData.password,
        })
        .expect(200);

      // Check response structure
      expect(response.body).toEqual({
        id: expect.any(String),
        name: validSignupData.name,
        email: validSignupData.email,
        role: validSignupData.role,
        token: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post(signinEndpoint)
        .send({
          email: validSignupData.email,
          password: 'wrong-password',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials provided');
    });

    it('should return 401 with non-existent email', async () => {
      const response = await request(app.getHttpServer())
        .post(signinEndpoint)
        .send({
          email: 'nonexistent@example.com',
          password: validSignupData.password,
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials provided');
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post(signinEndpoint)
        .send({})
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'Please provide a valid email address',
          'Password must be between 4 and 20 characters',
        ]),
      );
    });

    it('should validate email format', async () => {
      const response = await request(app.getHttpServer())
        .post(signinEndpoint)
        .send({
          email: 'invalid-email',
          password: validSignupData.password,
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining(['Please provide a valid email address']),
      );
    });

    it('should validate password length', async () => {
      const response = await request(app.getHttpServer())
        .post(signinEndpoint)
        .send({
          email: validSignupData.email,
          password: '123', // too short
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'Password must be between 4 and 20 characters',
        ]),
      );
    });
  });
});
