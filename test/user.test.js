import request from 'supertest';
import app from '../app.js';


// // // Testing post endpoint to create a new user
describe('API users test', () => {
  it('You should create a new user successfully.', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: '1234',
        agreeToTerms: true,
        role: 'recipient',
        charityId: 465
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Successfully saved new user.');
  });
  
  it('It should return a 400 error for invalid fields.', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        firstName: '',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'bad',
        agreeToTerms: false,
        role: 'invalid-role'
      });

    expect(response.status).toBe(400);
    // Check the specific error message you expect to receive.
    expect(response.body.message).toBe('Invalid input for First Name. Invalid input for Email Address. Invalid input for Password. Invalid input for Role. Available roles at this endpoint are: \'donor\', \'recipient\', or \'charity\'.');
  });
  
  it('It should return a 409 error if the email is already in use.', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test2@example.com',
        password: '1234',
        agreeToTerms: true,
        role: 'recipient',
        charityId: 465
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('An account with this email address already exists.');
  });
});

// // //Test email verification
describe('API users test email verification', () => {
  it('It should redirect to the success page after token verification.', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTY4NjkzNTgwOCwiZXhwIjoxNjg3MDE4NjA4fQ.V2T3Yf9cA_QyYanp36qlq7qFaWqtH3wZj_lTgwa6o8c'; // Insert here the valid token you want to test.
    const response = await request(app)
      .get(`/api/v1/users/verify/${token}`)
      .expect(302); // Check if the response status is 302 (redirection)

    expect(response.header.location).toBe('/email_verify_success.html');
  });

  it('It should return a 400 error if the token is invalid', async () => {
    const token = '$2a$10$OWojPnrPLxX0TfV5NCaqEu65gSOKaWCAcupoYmekuxKq1eHC68'; // Insert here an invalid token to test.
    const response = await request(app)
      .get(`/api/v1/users/verify/${token}`)
      .expect(400); // Check if the response status is 400

    expect(response.body.message).toBe('Email verification failed. Invalid token.');
  });

  it('It should redirect to the expiration page if the token is expired', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTY4NjY4MjgwMSwiZXhwIjoxNjg2NzY1NjAxfQ.Knwztm-O23qTkkLi6M98wqjULrn1b9QaPHFFsgNXyQI'; // Insert here a valid but expired token to test.
    const response = await request(app)
      .get(`/api/v1/users/verify/${token}`)
      .expect(302); // Check if the response status is 302 (redirection)

    expect(response.header.location).toBe('/email_verify_expired.html');
  });
});

// //Test email resend verification email
describe('Verification Email Resend API', () => {
  it('It should send another verification email', async () => {
    const email = 'fakeadmin@email.com'; // Insert a valid email address to test

    const response = await request(app)
      .post('/api/v1/users/verify/resend')
      .send({ email })
      .expect(200); // A successful response with a status code of 200 is expected.

    expect(response.body.message).toBe('Successfully sent another verification email.');
  });
});

// //Test login
describe('Login test', () => {
  test('It should return a valid authentication token', async () => {
    const user = {
      email: 'fakeadmin@email.com',
      password: '12345678',
    };

    const response = await request(app)
      .post('/api/v1/users/login')
      .send(user)
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body.token).toBeTruthy();
  });

  test('It should return an invalid input error for the email', async () => {
    const user = {
      email: 'invalidemail',
      password: 'bad12345',
    };

    const response = await request(app)
      .post('/api/v1/users/login')
      .send(user)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Invalid input for email address');
  });

  test('It should return an invalid input error for the password', async () => {
    const user = {
      email: 'john@email.com',
      password: '123', // Senha inválida
    };

    const response = await request(app)
      .post('/api/v1/users/login')
      .send(user)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Invalid input for password');
  });

  test('It should return an error for incorrect email and/or password', async () => {
    const user = {
      email: 'wrongemail@example.com',
      password: 'wrongpassword',
    };

    const response = await request(app)
      .post('/api/v1/users/login')
      .send(user)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Email and/or password incorrect');
  });
});

//Test delete
describe('Delete test', () => {
  test('It should return a success message upon deleting the user', async () => {
    const userId = 22; // User ID to be deleted
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyLCJyb2xlIjoicmVjaXBpZW50Iiwic3RhdHVzIjoiYWN0aXZlIiwiaWF0IjoxNjg2OTM3MTcxLCJleHAiOjE2ODcwMTk5NzF9.jlR5UlfZLglpqcKYjzgjGWbSLsAA3OyAgqJMI3-_cSc'; // User token to be deleted

    const response = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set('Authorization', 'Bearer ${token}')
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Successfully deleted the user.');
  });

  test('It should return an error when attempting to delete a non-existent user', async () => {
    const userId = 999; // ID de um usuário que não existe

    const response = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set('Authorization', 'Bearer ${token}')
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('A user with that id was not found in the database.');
  });
});