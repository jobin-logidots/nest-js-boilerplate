import request from 'supertest';
import {
  APP_URL,
  TESTER_EMAIL,
  TESTER_PASSWORD,
} from '../utils/constants';

describe('Auth user (e2e)', () => {
  const app = APP_URL;
  const newUserFirstName = `Tester${Date.now()}`;
  const newUserLastName = `E2E`;
  const newUserEmail = `User.${Date.now()}@example.com`;
  const newUserPassword = `secret`;

  it('Login: /api/v1/auth/email/login (POST)', () => {
    return request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: TESTER_EMAIL, password: TESTER_PASSWORD })
      .expect(200)
      .expect(({ body }) => {
        expect(body.token).toBeDefined();
        expect(body.refreshToken).toBeDefined();
        expect(body.tokenExpires).toBeDefined();
        expect(body.user.email).toBeDefined();
        expect(body.user.hash).not.toBeDefined();
        expect(body.user.password).not.toBeDefined();
        expect(body.user.previousPassword).not.toBeDefined();
      });
  });

  it('Register new user: /api/v1/auth/email/register (POST)', () => {
    return request(app)
      .post('/api/v1/auth/email/register')
      .send({
        email: newUserEmail,
        password: newUserPassword,
        firstName: newUserFirstName,
        lastName: newUserLastName,
      })
      .expect(204);
  });

  it('Do not allow register user with existing email: /api/v1/auth/email/register (POST)', () => {
    return request(app)
      .post('/api/v1/auth/email/register')
      .send({
        email: TESTER_EMAIL,
        password: TESTER_PASSWORD,
        firstName: 'Tester',
        lastName: 'E2E',
      })
      .expect(409);
  });

  it('Login new user: /api/v1/auth/email/login (POST)', () => {
    return request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: newUserEmail, password: newUserPassword })
      .expect(200)
      .expect(({ body }) => {
        expect(body.token).toBeDefined();
        expect(body.refreshToken).toBeDefined();
        expect(body.tokenExpires).toBeDefined();
        expect(body.user.email).toBeDefined();
      });
  });

  describe('Authenticated user actions', () => {
    let userToken: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserPassword });
      userToken = response.body.token;
    });

    it('Get profile: /api/v1/auth/me (GET)', () => {
      return request(app)
        .get('/api/v1/auth/me')
        .auth(userToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.provider).toBeDefined();
          expect(body.email).toBeDefined();
          expect(body.hash).not.toBeDefined();
          expect(body.password).not.toBeDefined();
          expect(body.previousPassword).not.toBeDefined();
        });
    });

    it('Refresh token: /api/v1/auth/refresh (POST)', async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserPassword });

      return request(app)
        .post('/api/v1/auth/refresh')
        .auth(loginResponse.body.refreshToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.token).toBeDefined();
          expect(body.refreshToken).toBeDefined();
          expect(body.tokenExpires).toBeDefined();
        });
    });

    it('Update profile: /api/v1/auth/me (PATCH)', async () => {
      const newName = Date.now().toString();
      const newPassword = 'new-secret';

      // Should fail without old password
      await request(app)
        .patch('/api/v1/auth/me')
        .auth(userToken, { type: 'bearer' })
        .send({
          firstName: newName,
          password: newPassword,
        })
        .expect(422);

      // Should succeed with old password
      await request(app)
        .patch('/api/v1/auth/me')
        .auth(userToken, { type: 'bearer' })
        .send({
          firstName: newName,
          password: newPassword,
          oldPassword: newUserPassword,
        })
        .expect(200);

      // Should be able to login with new password
      await request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newPassword })
        .expect(200);

      // Revert password change
      await request(app)
        .patch('/api/v1/auth/me')
        .auth(userToken, { type: 'bearer' })
        .send({
          password: newUserPassword,
          oldPassword: newPassword,
        })
        .expect(200);
    });

    it('Delete profile: /api/v1/auth/me (DELETE)', async () => {
      await request(app)
        .delete('/api/v1/auth/me')
        .auth(userToken, { type: 'bearer' })
        .expect(204);

      // Should not be able to login after deletion
      await request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserPassword })
        .expect(422);
    });
  });
});
