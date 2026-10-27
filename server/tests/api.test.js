const request = require('supertest');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const seedDatabase = require('../scripts/seed');

let adminToken;
let userToken;
let secondUserToken;
let sampleMovieId;
let sampleShowtimeId;
let sampleBookingId;

beforeAll(async () => {
  // Ensure database connected and seeded
  await connectDB();
  await seedDatabase();

  // Login admin to obtain token
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@imovies.com',
      password: 'Admin@123456'
    });
  adminToken = adminRes.body.token;

  // Login demo user to obtain token
  const userRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'alex@example.com',
      password: 'Password@123'
    });
  userToken = userRes.body.token;

  // Login second user
  const secondUserRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'sophia@example.com',
      password: 'Password@123'
    });
  secondUserToken = secondUserRes.body.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('Module A: Authentication & Authorization Tests', () => {
  test('1. Valid registration succeeds and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Viewer',
        email: 'testviewer@example.com',
        password: 'Password@123',
        phone: '+1 555 999 8888'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('testviewer@example.com');
    expect(res.body.user.password).toBeUndefined(); // Must never expose password
  });

  test('2. Duplicate email registration fails with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Alex',
        email: 'alex@example.com',
        password: 'Password@123'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('3. Invalid login credentials fail with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@example.com',
        password: 'WrongPassword999'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('4. Non-admin users cannot access admin dashboard API (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('5. Admin user can successfully access admin dashboard API', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalMovies).toBeGreaterThan(0);
  });
});

describe('Module B & C: Movies & Discovery Tests', () => {
  test('6. GET /api/movies retrieves movie list with pagination & filters', async () => {
    const res = await request(app).get('/api/movies');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.movies.length).toBeGreaterThan(0);

    sampleMovieId = res.body.movies[0]._id;
  });

  test('7. Search movies by title returns filtered results', async () => {
    const res = await request(app).get('/api/movies?search=Oppenheimer');

    expect(res.status).toBe(200);
    expect(res.body.movies.some(m => m.title.includes('Oppenheimer'))).toBe(true);
  });

  test('8. GET /api/movies/:id returns movie details and scheduled showtimes', async () => {
    const res = await request(app).get(`/api/movies/${sampleMovieId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.movie._id).toBe(sampleMovieId);
    expect(Array.isArray(res.body.showtimes)).toBe(true);

    // Pick a future showtime so past-time check passes
    const now = new Date();
    const futureShow = res.body.showtimes.find(s => {
      const showTime = new Date(`${s.date}T${s.startTime}:00`);
      return showTime > now;
    });

    if (futureShow) {
      sampleShowtimeId = futureShow._id;
    }
  });
});

describe('Module D & E: Showtime, Seat Selection & Reservation Tests', () => {
  test('9. GET /api/showtimes/:id/seats returns cinema grid layout & seat statuses', async () => {
    // If not set from movie showtimes, fetch from /api/showtimes
    if (!sampleShowtimeId) {
      const showtimesRes = await request(app).get('/api/showtimes');
      const now = new Date();
      const futureShow = showtimesRes.body.showtimes.find(s => new Date(`${s.date}T${s.startTime}:00`) > now);
      sampleShowtimeId = futureShow ? futureShow._id : showtimesRes.body.showtimes[0]._id;
    }

    const res = await request(app).get(`/api/showtimes/${sampleShowtimeId}/seats`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.grid)).toBe(true);
    expect(res.body.grid.length).toBe(8); // 8 rows A-H
  });

  test('10. User can reserve available seats (POST /api/showtimes/:id/reservations)', async () => {
    const res = await request(app)
      .post(`/api/showtimes/${sampleShowtimeId}/reservations`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        seatIdentifiers: ['C3', 'C4']
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reservedSeats).toEqual(['C3', 'C4']);
  });

  test('11. Another user cannot reserve the currently held seats (409 Conflict)', async () => {
    const res = await request(app)
      .post(`/api/showtimes/${sampleShowtimeId}/reservations`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .send({
        seatIdentifiers: ['C3']
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('Module F & G: Booking & Demo Payment Workflow Tests', () => {
  test('12. Creating a booking calculates total prices accurately on server', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        showtimeId: sampleShowtimeId,
        seatIdentifiers: ['C3', 'C4']
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingReference).toMatch(/^IMV-[A-Z0-9]+$/);
    expect(res.body.booking.ticketQuantity).toBe(2);
    expect(res.body.booking.bookingStatus).toBe('Pending');
    expect(res.body.booking.totalAmount).toBeGreaterThan(0);

    sampleBookingId = res.body.booking._id;
  });

  test('13. User cannot view another private user booking (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/bookings/${sampleBookingId}`)
      .set('Authorization', `Bearer ${secondUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('14. Demo payment simulation confirms booking and marks seats booked', async () => {
    const res = await request(app)
      .post('/api/payments/demo')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        bookingId: sampleBookingId,
        action: 'success',
        paymentMethod: 'Demo Card'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingStatus).toBe('Confirmed');
    expect(res.body.booking.paymentStatus).toBe('Paid');
  });

  test('15. Confirmed seats cannot be reserved by another user', async () => {
    const res = await request(app)
      .post(`/api/showtimes/${sampleShowtimeId}/reservations`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .send({
        seatIdentifiers: ['C3']
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('16. Booking cancellation successfully frees seats and updates status', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${sampleBookingId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        reason: 'Change of schedule'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingStatus).toBe('Cancelled');
    expect(res.body.booking.paymentStatus).toBe('Refunded');

    // Seat C3 should now be available again for other users
    const reserveRes = await request(app)
      .post(`/api/showtimes/${sampleShowtimeId}/reservations`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .send({
        seatIdentifiers: ['C3']
      });

    expect(reserveRes.status).toBe(200);
    expect(reserveRes.body.success).toBe(true);
  });
});
