const jwt = require('jsonwebtoken');
require('dotenv/config');

module.exports = (request, response, next) => {
  try {
    const authHeader = request.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      response.status(401).json({ error: 'Authorization token is required.' });
      return;
    }

    if (!process.env.JWT_SECRET) {
      response.status(500).json({ error: 'JWT secret is not configured.' });
      return;
    }

    const token = authHeader.slice('Bearer '.length);
    request.user = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (error) {
    response.status(401).json({ error: 'Invalid or expired token.' });
  }
};
