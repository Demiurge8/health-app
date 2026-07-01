const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv/config');

const User = require('./models/userModel');
const ContactModel = require('./models/contactModel');
const HeartRateData = require('./models/heartRateDataModel');
const jwt = require('jsonwebtoken');
const auth = require('./auth');

const app = express();

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
};

const getJwtSecret = () => getRequiredEnv('JWT_SECRET');

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const sanitizeUser = (user) => ({
  id: user._id,
  email: user.email,
});

const createToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      userEmail: user.email,
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

const buildRecommendation = (heartRate) =>
  heartRate > 120 || heartRate < 50
    ? 'Pay attention, you have some problem with heart rate!'
    : 'The data are within normal limits.';

const normalizeHeartRatePayload = ({ time, date, heartRate, recommendation }) => {
  const parsedHeartRate = Number(heartRate);
  const parsedDate = new Date(date);
  const normalizedTime = String(time || '').trim();

  if (!normalizedTime || !date || !Number.isFinite(parsedDate.getTime())) {
    return { error: 'Valid time and date are required.' };
  }

  if (!Number.isFinite(parsedHeartRate) || parsedHeartRate <= 0) {
    return { error: 'Heart rate must be a positive number.' };
  }

  return {
    value: {
      time: normalizedTime,
      date: parsedDate.toISOString().split('T')[0],
      heartRate: parsedHeartRate,
      recommendation: recommendation || buildRecommendation(parsedHeartRate),
    },
  };
};

const validateObjectId = (id, response) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return true;
  }

  response.status(400).json({ error: 'Invalid record id.' });
  return false;
};

app.get('/free-endpoint', (request, response) => {
  response.json({ message: 'You are free to access me anytime' });
});

app.get('/auth-endpoint', auth, (request, response) => {
  response.json({ message: 'You are authorized to access me' });
});

app.post('/register', async (request, response) => {
  try {
    const email = normalizeEmail(request.body.email);
    const { password } = request.body;

    if (!email || !password) {
      response.status(400).send({ message: 'Email and password are required.' });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      response.status(409).send({ message: 'Email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    response.status(201).send({
      message: 'User created successfully.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      response.status(409).send({ message: 'Email already exists.' });
      return;
    }

    response.status(500).send({
      message: 'Error creating user.',
      error: error.message,
    });
  }
});

app.post('/login', async (request, response) => {
  try {
    const email = normalizeEmail(request.body.email);
    const { password } = request.body;

    if (!email || !password) {
      response.status(400).send({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      response.status(401).send({ message: 'Invalid email or password.' });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      response.status(401).send({ message: 'Invalid email or password.' });
      return;
    }

    response.status(200).send({
      message: 'Login successful.',
      email: user.email,
      token: createToken(user),
    });
  } catch (error) {
    response.status(500).send({
      message: 'Login failed.',
      error: error.message,
    });
  }
});

app.post('/contact', async (request, response) => {
  try {
    const { name, email, message } = request.body;

    if (!name || !email || !message) {
      response.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    await ContactModel.create({ name, email, message });

    response.status(201).json({ success: true, message: 'Data added successfully.' });
  } catch (error) {
    response.status(500).json({ success: false, message: 'Failed to add data to MongoDB.' });
  }
});

app.get('/heart-rate-data', auth, async (request, response) => {
  try {
    const data = await HeartRateData.find({}).sort({ date: -1, time: -1 });

    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch heart rate data from MongoDB.' });
  }
});

app.post('/heart-rate-data', auth, async (request, response) => {
  try {
    const { value, error } = normalizeHeartRatePayload(request.body);

    if (error) {
      response.status(400).json({ error });
      return;
    }

    const newHeartRateData = await HeartRateData.create(value);

    response.status(201).json({
      message: 'Heart rate data added successfully.',
      record: newHeartRateData,
    });
  } catch (error) {
    response.status(500).json({ error: 'Failed to add heart rate data to MongoDB.' });
  }
});

app.post('/heart-rate-data/seed', auth, async (request, response) => {
  try {
    const startDate = new Date('2023-06-25');
    const heartRateData = [];

    for (let i = 0; i < 72; i += 1) {
      const currentTime = new Date(startDate.getTime() + i * 60 * 60 * 1000);
      const heartRate = Math.floor(Math.random() * (200 - 60 + 1)) + 60;

      heartRateData.push({
        time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: currentTime.toISOString().split('T')[0],
        heartRate,
        recommendation: buildRecommendation(heartRate),
      });
    }

    await HeartRateData.insertMany(heartRateData);

    response.status(201).json({ message: 'Heart rate data added to MongoDB successfully.' });
  } catch (error) {
    response.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/heart-rate-data/:id', auth, async (request, response) => {
  try {
    const { id } = request.params;

    if (!validateObjectId(id, response)) {
      return;
    }

    const { value, error } = normalizeHeartRatePayload(request.body);

    if (error) {
      response.status(400).json({ error });
      return;
    }

    const updatedHeartRateData = await HeartRateData.findByIdAndUpdate(id, value, { new: true });

    if (!updatedHeartRateData) {
      response.status(404).json({ error: 'Record not found.' });
      return;
    }

    response.status(200).json({
      message: 'Record updated successfully.',
      record: updatedHeartRateData,
    });
  } catch (error) {
    response.status(500).json({ error: 'Failed to update record.' });
  }
});

app.delete('/heart-rate-data/:id', auth, async (request, response) => {
  try {
    const { id } = request.params;

    if (!validateObjectId(id, response)) {
      return;
    }

    const deletedRecord = await HeartRateData.findByIdAndDelete(id);

    if (!deletedRecord) {
      response.status(404).json({ error: 'Record not found.' });
      return;
    }

    response.status(200).json({ message: 'Record deleted successfully.' });
  } catch (error) {
    response.status(500).json({ error: 'Failed to delete record.' });
  }
});

app.use((error, request, response, next) => {
  if (error.message === 'Not allowed by CORS') {
    response.status(403).json({ error: 'CORS origin denied.' });
    return;
  }

  next(error);
});

const startServer = async () => {
  try {
    await mongoose.connect(getRequiredEnv('DB_URI'));
    console.log('DB connected');

    const port = process.env.PORT || 4000;

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
