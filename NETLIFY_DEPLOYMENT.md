# Deploying to Netlify

This guide will help you deploy the Job Card for Vehicle Service application to Netlify.

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **MongoDB Atlas**: Ensure you have a MongoDB Atlas cluster (or other cloud MongoDB)
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Environment Variables

You'll need to set these environment variables in Netlify:

### Required Variables

- `MONGODB_URI` - Your MongoDB connection string
  ```
  mongodb+srv://username:password@cluster.mongodb.net/vehicle-service?retryWrites=true&w=majority
  ```

- `JWT_SECRET` - A strong random string for JWT signing
  ```
  your-super-secret-jwt-key-change-this-in-production
  ```

- `NODE_ENV` - Set to `production`

### Optional Variables (for Socket.IO)

If you want real-time notifications, you'll need to set up an external Socket.IO service:

- `REACT_APP_SOCKET_ENABLED` - Set to `true` to enable
- `REACT_APP_SOCKET_URL` - URL of your Socket.IO server

## Step 2: Connect Repository to Netlify

1. Log in to your Netlify account
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository: `Job-Card-for-Vehicle-Service`
5. Netlify will auto-detect the `netlify.toml` configuration

## Step 3: Configure Build Settings

Netlify should automatically detect settings from `netlify.toml`, but verify:

- **Build command**: `cd frontend && npm install && npm run build`
- **Publish directory**: `frontend/build`
- **Functions directory**: `netlify/functions`

## Step 4: Set Environment Variables

1. In your Netlify site dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add each variable from Step 1:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB connection string
   - Scope: All scopes
   - Click **"Create variable"**
4. Repeat for `JWT_SECRET` and `NODE_ENV`

## Step 5: Deploy

1. Click **"Deploy site"**
2. Netlify will:
   - Install dependencies
   - Build the React frontend
   - Deploy serverless functions
   - Publish your site

## Step 6: Verify Deployment

Once deployed, test your application:

1. **Frontend**: Visit your Netlify URL (e.g., `https://your-site.netlify.app`)
2. **Login**: Try logging in with existing credentials
3. **API**: Check browser console for any API errors
4. **Database**: Verify data is loading from MongoDB

## Troubleshooting

### Build Fails

- Check the build logs in Netlify dashboard
- Ensure all dependencies are listed in `package.json`
- Verify Node version compatibility

### API Errors (500/502)

- Check Netlify Functions logs
- Verify `MONGODB_URI` is set correctly
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Netlify IPs

### CORS Errors

- The `netlify.toml` includes CORS headers
- Check browser console for specific CORS issues
- Verify API calls are going to `/api/*` paths

### Database Connection Issues

- Verify MongoDB Atlas network access allows all IPs
- Check that connection string includes database name
- Ensure MongoDB user has proper permissions

## Local Development

For local development, you can still use the backend server:

1. Create `.env` file in `backend/` directory:
   ```bash
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   PORT=5000
   NODE_ENV=development
   ```

2. Create `.env` file in `frontend/` directory:
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_ENABLED=true
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

3. Run backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. Run frontend (in another terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS

## Continuous Deployment

Netlify automatically deploys when you push to your main branch:

1. Make changes to your code
2. Commit and push to Git
3. Netlify automatically rebuilds and deploys

## Notes

- **Socket.IO**: Real-time notifications won't work with Netlify Functions by default. Consider using Pusher, Ably, or hosting Socket.IO separately on Heroku/Railway.
- **File Uploads**: If using multer for file uploads, consider using Netlify Blobs or external storage (AWS S3, Cloudinary).
- **Cold Starts**: First request to serverless functions may be slow. Subsequent requests will be faster.

## Support

If you encounter issues:
- Check Netlify Functions logs
- Review MongoDB Atlas logs
- Check browser console for errors
- Verify all environment variables are set correctly
