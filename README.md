# Health App

Health App is a React and Express application for tracking heart-rate records, viewing charts, exporting data, and sending contact messages.

## Project Structure

- `frontend/` - Create React App frontend.
- `backend/` - Express API with MongoDB through Mongoose.
- `backend/.env.example` - backend environment variable template.
- `frontend/.env.example` - frontend environment variable template.

## Requirements

- Node.js
- npm
- MongoDB connection string

## Configuration

Create `backend/.env` from `backend/.env.example`:

```env
DB_URI=mongodb://127.0.0.1:27017/health-app
PORT=4000
JWT_SECRET=replace-with-a-secure-random-secret
JWT_EXPIRES_IN=24h
CLIENT_ORIGIN=http://localhost:3000
```

Create `frontend/.env` from `frontend/.env.example` when the API is not served from the same origin:

```env
REACT_APP_API_URL=http://localhost:4000
```

## Install

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run

Start the backend:

```bash
cd backend
npm start
```

Start the frontend:

```bash
cd frontend
npm start
```

## Checks

```bash
cd backend
node --check index.js
node --check auth.js

cd ../frontend
npm test -- --watchAll=false
npm run build
```

## Main API

- `POST /register`
- `POST /login`
- `GET /heart-rate-data`
- `POST /heart-rate-data`
- `PUT /heart-rate-data/:id`
- `DELETE /heart-rate-data/:id`
- `POST /contact`

Heart-rate endpoints require `Authorization: Bearer <token>`.
