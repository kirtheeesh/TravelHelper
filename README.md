# Travel Helper

A travel planning application built with React, Express, and MongoDB, featuring Google OAuth 2.0 authentication.

## Prerequisites

- Node.js (v20 or higher)
- MongoDB Atlas account
- Google Cloud Console account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=a_random_secure_string
AUTH_REDIRECT_URL=http://127.0.0.1:5000/api/auth/google/callback
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Run the development server:
```bash
npm run dev
```
The application will be available at `http://127.0.0.1:5000`.

## Deployment (Render)

1. Connect your GitHub repository to Render.
2. Set the **Build Command**: `npm run build`
3. Set the **Start Command**: `npm run start`
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: your production MongoDB URI
   - `GOOGLE_CLIENT_ID`: your Google Client ID
   - `GOOGLE_CLIENT_SECRET`: your Google Client Secret
   - `SESSION_SECRET`: a secure random string
   - `AUTH_REDIRECT_URL`: `https://TravelHelper.onrender.com/api/auth/google/callback`

## Google OAuth Configuration

Ensure your Google Cloud Console "OAuth 2.0 Client ID" is configured with:

### Authorized JavaScript origins
- `http://localhost:5000`
- `http://127.0.0.1:5000`
- `https://TravelHelper.onrender.com`

### Authorized redirect URIs
- `http://localhost:5000/api/auth/google/callback`
- `http://127.0.0.1:5000/api/auth/google/callback`
- `https://TravelHelper.onrender.com/api/auth/google/callback`
