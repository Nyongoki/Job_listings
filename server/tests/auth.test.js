// Set environment variables for tests before loading database or app
process.env.DB_PATH = './db/homeland_test.sqlite';
process.env.JWT_SECRET = 'your_test_jwt_secret_min_32_chars_long';
process.env.REFRESH_SECRET = 'your_test_refresh_secret_min_32_chars_long';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const db = require('../src/db');

describe('Authentication & Role Authorization API Tests', () => {
  
  beforeEach(() => {
    // Clear users, jobs, and tokens tables before each test to guarantee isolation
    db.exec('DELETE FROM refresh_tokens');
    db.exec('DELETE FROM jobs');
    db.exec('DELETE FROM users');
  });

  afterAll(async () => {
    // Close the SQLite connection so the file is not locked
    db.close();
    
    // Attempt deleting the test database file
    const dbFile = path.resolve(__dirname, '../../db/homeland_test.sqlite');
    if (fs.existsSync(dbFile)) {
      try {
        fs.unlinkSync(dbFile);
      } catch (err) {
        // Fallback if locked
      }
    }
  });

  // Test 1: Successful registration returns 201 with correct shape
  test('Successful registration returns 201 with correct shape', async () => {
    const registerBody = {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "0712345678",
      password: "Password123",
      role: "freelancer"
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(registerBody);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(registerBody.email);
    expect(res.body.user.role).toBe(registerBody.role);
    expect(res.body.user.name).toBe(registerBody.name);
    expect(res.body.user).toHaveProperty('user_id');
    expect(res.body.user).toHaveProperty('created_at');
    
    // Assert: response body does NOT have password_hash anywhere
    const resString = JSON.stringify(res.body);
    expect(resString).not.toContain('password_hash');
    expect(resString).not.toContain('passwordHash');
    expect(res.body.user.password_hash).toBeUndefined();
    expect(res.body.password_hash).toBeUndefined();
  });

  // Test 2: Login with wrong password returns 401
  test('Login with wrong password returns 401', async () => {
    // 1. First register a user
    const registerBody = {
      name: "John LoginTest",
      email: "john_test@example.com",
      phone: "0722345678",
      password: "Password123",
      role: "freelancer"
    };

    await request(app)
      .post('/api/auth/register')
      .send(registerBody);

    // 2. Try logging in with a wrong password
    const loginBody = {
      email: "john_test@example.com",
      password: "WrongPassword999"
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginBody);

    // Assert: status 401
    expect(res.status).toBe(401);
    
    // Assert: response body has { error: "Invalid email or password" }
    expect(res.body).toEqual({ error: "Invalid email or password" });
  });

  // Test 3: Freelancer cannot POST a job (returns 403)
  test('Freelancer cannot POST a job (returns 403)', async () => {
    // 1. Register a freelancer
    const freelancerRegister = {
      name: "Freelancer Bob",
      email: "bob_freelancer@example.com",
      phone: "0733345678",
      password: "Password123",
      role: "freelancer"
    };

    await request(app)
      .post('/api/auth/register')
      .send(freelancerRegister);

    // 2. Log in to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: "bob_freelancer@example.com",
        password: "Password123"
      });

    const token = loginRes.body.accessToken;
    expect(token).toBeDefined();

    // 3. Attempt posting a job with freelancer's token
    const jobBody = {
      title: "Malicious Job Posting",
      description: "Should not be allowed by a freelancer role user.",
      category: "Web Development",
      location: "Nairobi",
      budget: 50000,
      skills: ["React", "TypeScript"],
      deadline: "2026-08-01"
    };

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send(jobBody);

    // Assert: status 403
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('Access forbidden');
  });

});
