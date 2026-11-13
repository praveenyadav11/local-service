process.env.NODE_ENV = 'test';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const mongoose = require('mongoose');

const app = require('../app');
const User = require('../models/User');
const Category = require('../models/Category');
const ProviderProfile = require('../models/ProviderProfile');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const generateToken = require('../utils/generateToken');

let server;
let base;

const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, data };
};

before(async () => {
  const uri = process.env.MONGO_URI_TEST;
  if (!uri || uri === process.env.MONGO_URI) {
    throw new Error('Set MONGO_URI_TEST to a separate database before running tests');
  }
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  await Booking.init();

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await new Promise((resolve) => server.close(resolve));
});

test('health check returns 200 and database connected', async () => {
  const { status, data } = await call('GET', '/api/health');
  assert.strictEqual(status, 200);
  assert.strictEqual(data.database, 'connected');
});

test('unknown route returns JSON 404', async () => {
  const { status, data } = await call('GET', '/api/nothing');
  assert.strictEqual(status, 404);
  assert.strictEqual(data.success, false);
});

test('register creates a customer and never returns the password', async () => {
  const { status, data } = await call('POST', '/api/auth/register', {
    body: { name: 'Test One', email: 'one@test.com', password: 'secret123' },
  });
  assert.strictEqual(status, 201);
  assert.ok(data.token);
  assert.strictEqual(data.user.role, 'customer');
  assert.strictEqual(data.user.password, undefined);
});

test('register rejects duplicate email with 409', async () => {
  const { status } = await call('POST', '/api/auth/register', {
    body: { name: 'Test One', email: 'one@test.com', password: 'secret123' },
  });
  assert.strictEqual(status, 409);
});

test('register rejects admin role with 400', async () => {
  const { status } = await call('POST', '/api/auth/register', {
    body: { name: 'Evil', email: 'evil@test.com', password: 'secret123', role: 'admin' },
  });
  assert.strictEqual(status, 400);
});

test('register rejects short password with 400', async () => {
  const { status } = await call('POST', '/api/auth/register', {
    body: { name: 'Short', email: 'short@test.com', password: '123' },
  });
  assert.strictEqual(status, 400);
});

test('login works, and wrong email and wrong password give the same 401', async () => {
  const ok = await call('POST', '/api/auth/login', {
    body: { email: 'one@test.com', password: 'secret123' },
  });
  assert.strictEqual(ok.status, 200);

  const wrongPass = await call('POST', '/api/auth/login', {
    body: { email: 'one@test.com', password: 'wrongpass' },
  });
  const wrongEmail = await call('POST', '/api/auth/login', {
    body: { email: 'nobody@test.com', password: 'secret123' },
  });
  assert.strictEqual(wrongPass.status, 401);
  assert.strictEqual(wrongEmail.status, 401);
  assert.strictEqual(wrongPass.data.message, wrongEmail.data.message);
});

test('login rejects NoSQL injection object with 400', async () => {
  const { status } = await call('POST', '/api/auth/login', {
    body: { email: { $gt: '' }, password: 'secret123' },
  });
  assert.strictEqual(status, 400);
});

test('/me needs a valid token', async () => {
  assert.strictEqual((await call('GET', '/api/auth/me')).status, 401);
  assert.strictEqual((await call('GET', '/api/auth/me', { token: 'abc.def.ghi' })).status, 401);

  const login = await call('POST', '/api/auth/login', {
    body: { email: 'one@test.com', password: 'secret123' },
  });
  const me = await call('GET', '/api/auth/me', { token: login.data.token });
  assert.strictEqual(me.status, 200);
  assert.strictEqual(me.data.user.email, 'one@test.com');
});

test('customer cannot access admin routes (403) and anonymous gets 401', async () => {
  const login = await call('POST', '/api/auth/login', {
    body: { email: 'one@test.com', password: 'secret123' },
  });
  assert.strictEqual((await call('GET', '/api/admin/analytics', { token: login.data.token })).status, 403);
  assert.strictEqual((await call('GET', '/api/admin/analytics')).status, 401);
});

test('double booking: two simultaneous requests for one slot give one 201 and one 409', async () => {
  const category = await Category.create({ name: 'Plumbing' });

  const providerUser = await User.create({
    name: 'Prov', email: 'prov@test.com', password: 'secret123', role: 'provider',
  });
  const profile = await ProviderProfile.create({
    user: providerUser._id, category: category._id, hourlyRate: 500, city: 'Hyderabad',
  });
  await Availability.create({
    provider: profile._id, workingDays: [0, 1, 2, 3, 4, 5, 6], startHour: 9, endHour: 17,
  });

  const c1 = await User.create({ name: 'C1', email: 'c1@test.com', password: 'secret123', phone: '9876543210' });
  const c2 = await User.create({ name: 'C2', email: 'c2@test.com', password: 'secret123', phone: '9876543211' });


  const t1 = generateToken(c1._id, c1.role);
  const t2 = generateToken(c2._id, c2.role);

  const d = new Date();
  d.setDate(d.getDate() + 3);
  const date = d.toLocaleDateString('en-CA');

  const body = { providerId: profile._id.toString(), date, startTime: '10:00', address: '1 Test Road' };

  const [a, b] = await Promise.all([
    call('POST', '/api/bookings', { token: t1, body }),
    call('POST', '/api/bookings', { token: t2, body }),
  ]);

  const statuses = [a.status, b.status].sort();
  assert.deepStrictEqual(statuses, [201, 409]);
  assert.strictEqual(await Booking.countDocuments({ provider: profile._id, date, startTime: '10:00' }), 1);
});

test('customer cannot confirm their own booking (403)', async () => {
  const booking = await Booking.findOne();
  const customer = await User.findById(booking.customer);
  const token = generateToken(customer._id, customer.role);

  const { status } = await call('PATCH', `/api/bookings/${booking._id}/status`, {
    token,
    body: { status: 'confirmed' },
  });
  assert.strictEqual(status, 403);
});