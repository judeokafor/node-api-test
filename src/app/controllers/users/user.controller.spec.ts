import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testApplication } from '../../../../test/test-app';
import { UserRole } from '../../domains/user/user.interface';
import { AuthService } from '../../domains/auth/auth.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;

  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    app = await testApplication();
    await app.init();

    authService = app.get<AuthService>(AuthService);

    // Create and sign in as admin
    const adminSignup = {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: UserRole.ADMIN,
    };
    const adminAuth = await authService.signUp(adminSignup);
    adminToken = adminAuth.token;

    // Create and sign in as regular user
    const userSignup = {
      name: 'Regular User',
      email: 'user@test.com',
      password: 'user123',
      role: UserRole.USER,
    };
    const userAuth = await authService.signUp(userSignup);
    userToken = userAuth.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    const endpoint = '/users';

    beforeEach(async () => {
      // Create a known set of test users
      const testUsers = Array.from({ length: 15 }, (_, i) => ({
        name: `Test User ${i + 1}`,
        email: `test-user-${i + 1}-${Math.random()}@example.com`,
        password: 'password123',
        role: UserRole.USER,
      }));

      // Create all users and store their IDs
      await Promise.all(testUsers.map((user) => authService.signUp(user)));
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer()).get(endpoint).expect(401);
    });

    it('should require admin role', async () => {
      await request(app.getHttpServer())
        .get(endpoint)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return paginated users with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(endpoint)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            email: expect.any(String),
            role: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: expect.any(Number),
          totalPages: expect.any(Number),
          hasNextPage: expect.any(Boolean),
          hasPreviousPage: expect.any(Boolean),
        },
      });
    });

    it('should respect pagination parameters and maintain consistency', async () => {
      const limit = 5;

      // Get first page
      const firstResponse = await request(app.getHttpServer())
        .get(endpoint)
        .query({ limit })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Get second page
      const secondResponse = await request(app.getHttpServer())
        .get(endpoint)
        .query({ page: 2, limit })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify pagination metadata
      expect(firstResponse.body.meta).toEqual(
        expect.objectContaining({
          currentPage: 1,
          itemsPerPage: limit,
          hasNextPage: true,
          hasPreviousPage: false,
        }),
      );

      expect(secondResponse.body.meta).toEqual(
        expect.objectContaining({
          currentPage: 2,
          itemsPerPage: limit,
          hasNextPage: true,
          hasPreviousPage: true,
        }),
      );

      // Verify data consistency
      expect(firstResponse.body.data.length).toBe(limit);
      expect(secondResponse.body.data.length).toBe(limit);

      // Check no duplicate IDs between pages
      const firstPageIds = firstResponse.body.data.map((user) => user.id);
      const secondPageIds = secondResponse.body.data.map((user) => user.id);
      const intersection = firstPageIds.filter((id) =>
        secondPageIds.includes(id),
      );
      expect(intersection.length).toBe(0);
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get(endpoint)
        .query({ page: 0, limit: 200 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'Page must be greater than or equal to 1',
          'Limit must be less than or equal to 100',
        ]),
      );
    });

    it('should handle empty pages correctly', async () => {
      const response = await request(app.getHttpServer())
        .get(endpoint)
        .query({ page: 999 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toEqual({
        data: [],
        meta: expect.objectContaining({
          currentPage: 999,
          totalItems: expect.any(Number),
          hasNextPage: false,
          hasPreviousPage: true,
        }),
      });
    });
  });

  describe('GET /users/me', () => {
    const endpoint = '/users/me';

    it('should require authentication', async () => {
      await request(app.getHttpServer()).get(endpoint).expect(401);
    });

    it('should return admin user details when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .get(endpoint)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'Admin User',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return regular user details when authenticated as user', async () => {
      const response = await request(app.getHttpServer())
        .get(endpoint)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'Regular User',
        email: 'user@test.com',
        role: UserRole.USER,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should not expose sensitive fields', async () => {
      const response = await request(app.getHttpServer())
        .get(endpoint)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Should not contain password
      expect(response.body).not.toHaveProperty('password');
    });

    it('should handle expired/invalid tokens', async () => {
      const invalidToken = 'invalid.token.here';

      await request(app.getHttpServer())
        .get(endpoint)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });

    it('should handle malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get(endpoint)
        .set('Authorization', 'malformed-header')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    const baseEndpoint = '/users';
    let testUserId: string;

    beforeEach(async () => {
      // Create a test user and store their ID
      const testUser = {
        name: 'Test Find User',
        email: `find-test${Math.random()}@example.com`,
        password: 'password123',
        role: UserRole.USER,
      };

      const { user } = await authService.signUp(testUser);
      testUserId = user.id;
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get(`${baseEndpoint}/${testUserId}`)
        .expect(401);
    });

    it('should return user details when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: testUserId,
        name: 'Test Find User',
        email: expect.any(String),
        role: UserRole.USER,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return user details when authenticated as the same user', async () => {
      const response = await request(app.getHttpServer())
        .get(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: testUserId,
          name: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
        }),
      );
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .get(`${baseEndpoint}/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe(
        `User with ID ${nonExistentId} not found`,
      );
    });

    it('should validate user ID format', async () => {
      const invalidId = 'invalid-uuid-format';

      const response = await request(app.getHttpServer())
        .get(`${baseEndpoint}/${invalidId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.message).toContain('Invalid UUID format');
    });

    it('should not expose sensitive fields', async () => {
      const response = await request(app.getHttpServer())
        .get(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).not.toHaveProperty('password');
    });

    it('should handle multiple concurrent requests for the same user', async () => {
      const requests = Array(5)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .get(`${baseEndpoint}/${testUserId}`)
            .set('Authorization', `Bearer ${adminToken}`),
        );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(testUserId);
      });
    });

    it('should return consistent data format across different roles', async () => {
      // Get user as admin
      const adminResponse = await request(app.getHttpServer())
        .get(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Get user as regular user
      const userResponse = await request(app.getHttpServer())
        .get(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Compare response structures
      expect(Object.keys(adminResponse.body)).toEqual(
        Object.keys(userResponse.body),
      );
    });
  });

  describe('DELETE /users/:id', () => {
    const baseEndpoint = '/users';
    let testUserId: string;
    let testUserToken: string;

    beforeEach(async () => {
      // Create a test user for deletion tests
      const testUser = {
        name: 'Delete Test User',
        email: `delete-test${Math.random()}@example.com`,
        password: 'password123',
        role: UserRole.USER,
      };

      const { user, token } = await authService.signUp(testUser);
      testUserId = user.id;
      testUserToken = token;
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete(`${baseEndpoint}/${testUserId}`)
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app.getHttpServer())
        .delete(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should successfully delete user when authenticated as admin', async () => {
      // Delete user
      await request(app.getHttpServer())
        .delete(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify user is deleted by trying to fetch them
      await request(app.getHttpServer())
        .get(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should prevent admin from deleting their own account', async () => {
      // Get admin's own ID
      const adminResponse = await request(app.getHttpServer())
        .get(`${baseEndpoint}/me`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const adminId = adminResponse.body.id;

      // Try to delete own account
      const response = await request(app.getHttpServer())
        .delete(`${baseEndpoint}/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(response.body.message).toBe('You cannot delete yourself');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .delete(`${baseEndpoint}/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe(
        `User with ID ${nonExistentId} not found`,
      );
    });

    it('should validate user ID format', async () => {
      const invalidId = 'invalid-uuid-format';

      const response = await request(app.getHttpServer())
        .delete(`${baseEndpoint}/${invalidId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.message).toContain('Invalid UUID format');
    });

    it('should prevent regular user from deleting other users', async () => {
      // Create another regular user
      const anotherUser = {
        name: 'Another User',
        email: `another-user${Math.random()}@example.com`,
        password: 'password123',
        role: UserRole.USER,
      };
      const { user } = await authService.signUp(anotherUser);

      // Try to delete the other user
      const response = await request(app.getHttpServer())
        .delete(`${baseEndpoint}/${user.id}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(403);

      expect(response.body.message).toContain('Forbidden resource');
    });

    it('should handle concurrent delete requests gracefully', async () => {
      // Create a user to delete
      const userToDelete = {
        name: 'Concurrent Delete Test',
        email: `concurrent-delete${Math.random()}@example.com`,
        password: 'password123',
        role: UserRole.USER,
      };
      const { user } = await authService.signUp(userToDelete);

      // Make multiple concurrent delete requests
      const requests = Array.from({ length: 3 }, () =>
        request(app.getHttpServer())
          .delete(`${baseEndpoint}/${user.id}`)
          .set('Authorization', `Bearer ${adminToken}`),
      );

      // Execute all requests
      await Promise.all(requests);

      // Verify final state - user should be deleted
      const finalCheckResponse = await request(app.getHttpServer())
        .get(`${baseEndpoint}/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(finalCheckResponse.body.message).toBe(
        `User with ID ${user.id} not found`,
      );
    });
  });

  describe('PATCH /users/:id', () => {
    const baseEndpoint = '/users';
    let testUserId: string;
    let testUserToken: string;

    beforeEach(async () => {
      // Create a test user for update tests
      const testUser = {
        name: 'Update Test User',
        email: `update-test${Math.random()}@example.com`,
        password: 'password123',
        role: UserRole.USER,
      };

      const { user, token } = await authService.signUp(testUser);
      testUserId = user.id;
      testUserToken = token;
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .patch(`${baseEndpoint}/${testUserId}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should allow users to update their own profile', async () => {
      const updateData = {
        name: 'Updated Name',
        email: `updated${Math.random()}@example.com`,
      };

      const response = await request(app.getHttpServer())
        .patch(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        id: testUserId,
        name: updateData.name,
        email: updateData.email,
        role: UserRole.USER,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should allow admins to update any user', async () => {
      const updateData = {
        name: 'Admin Updated Name',
        role: UserRole.ADMIN,
      };

      const response = await request(app.getHttpServer())
        .patch(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: testUserId,
          name: updateData.name,
          role: updateData.role,
        }),
      );
    });

    it('should prevent regular users from updating other users', async () => {
      // Create another user
      const anotherUser = {
        name: 'Another User',
        email: `another-update${Math.random()}@example.com`,
        password: 'password123',
        role: UserRole.USER,
      };
      const { user } = await authService.signUp(anotherUser);

      await request(app.getHttpServer())
        .patch(`${baseEndpoint}/${user.id}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ name: 'Hacked Name' })
        .expect(403);
    });

    it('should prevent regular users from updating their role', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ role: UserRole.ADMIN })
        .expect(403);

      expect(response.body.message).toBe(
        'You are not authorized to update this user',
      );
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .patch(`${baseEndpoint}/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.message).toBe(
        `User with ID ${nonExistentId} not found`,
      );
    });

    it('should validate user ID format', async () => {
      const invalidId = 'invalid-uuid-format';

      const response = await request(app.getHttpServer())
        .patch(`${baseEndpoint}/${invalidId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Name' })
        .expect(400);

      expect(response.body.message).toContain('Invalid UUID format');
    });

    it('should prevent duplicate email updates', async () => {
      // Create another user with known email
      const existingEmail = `existing${Math.random()}@example.com`;
      await authService.signUp({
        name: 'Existing User',
        email: existingEmail,
        password: 'password123',
        role: UserRole.USER,
      });

      // Try to update test user with existing email
      const response = await request(app.getHttpServer())
        .patch(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ email: existingEmail })
        .expect(409);

      expect(response.body.message).toBe(
        `Email ${existingEmail} is already in use`,
      );
    });

    it('should validate email format', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${baseEndpoint}/${testUserId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining(['Please provide a valid email address']),
      );
    });
  });
});
