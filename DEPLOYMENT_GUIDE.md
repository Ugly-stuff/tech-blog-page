# Deployment Guide: Render (Backend) & Vercel (Frontend)

## ✅ What Was Fixed

1. **Frontend URLs**: All hardcoded `http://localhost:5000` references replaced with `import.meta.env.VITE_API_URL`
   - `EditBlog.jsx`
   - `MyBlog.jsx`
   - `CreateBlog.jsx`

2. **BackButton**: Fixed className typo from `text-sm-blue-600` to `text-sm text-blue-600`

3. **Backend CORS**: Updated to properly handle production origins while maintaining security

4. **Environment Configuration**: Created `.env.example` files for reference

---

## 🚀 Backend Deployment (Render)

### Prerequisites
- Render account (render.com)
- GitHub repository with your code

### Setup Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix production deployment issues"
   git push
   ```

2. **Create a new Web Service on Render**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Select the backend folder (or specify the correct path)

3. **Set Environment Variables on Render**
   Dashboard → Settings → Environment
   
   ```
   JWT_SECRET=your_strong_secret_key_here
   MONGO_URL=your_mongodb_connection_string
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   NODE_ENV=production
   ```

4. **Firebase Admin Setup on Render**
   
   **Option A: Using Environment Variable (Recommended)**
   - Download your `serviceAccountKey.json` from Firebase Console
   - Copy its entire content
   - Go to Render → Environment → Add new variable
   - Name: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Paste the JSON content
   - Update `firebaseAdmin.js` to read from env var:
   
   ```javascript
   let serviceAccount;
   if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
       serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
   } else if (fs.existsSync(serviceAccountPath)) {
       serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
   }
   ```

   **Option B: Using File (Not recommended for production)**
   - Upload `serviceAccountKey.json` to your repository
   - Make sure it's in `.gitignore` if you commit sensitive keys
   - Current setup in `firebaseAdmin.js` will use it automatically

5. **Build Command**
   - Root directory: `./backEND`
   - Build command: `npm install` (if not auto-detected)
   - Start command: `npm start` or `node server.js`

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your Render URL (e.g., `https://tech-blog-page.onrender.com`)

---

## 🎨 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (vercel.com)
- GitHub repository with your code

### Setup Steps

1. **Update Frontend .env**
   ```
   VITE_API_URL=https://your-render-backend-url.onrender.com
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=userconfig-3e055.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=userconfig-3e055
   ```

2. **Deploy to Vercel**
   - Go to Vercel Dashboard → New Project
   - Import your GitHub repository
   - Select the `frontEND` folder as root directory
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Set Environment Variables on Vercel**
   - Project Settings → Environment Variables
   - Add the same variables as in `.env` file:
   
   ```
   VITE_API_URL=https://your-render-backend-url.onrender.com
   VITE_FIREBASE_API_KEY=AIzaSyBihuAJ70ZsXH12zIF21BGbMWQCrQpLCnQ
   VITE_FIREBASE_AUTH_DOMAIN=userconfig-3e055.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=userconfig-3e055
   ```

4. **Update Backend CORS**
   - Update `FRONTEND_URL` env variable on Render with your Vercel domain
   - Example: `https://your-app.vercel.app`
   - This allows requests from Vercel frontend

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Note your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## 🔐 Google Authentication Setup

### Important: OAuth2 Authorized Redirect URIs
You need to register your production domains with Google Firebase

1. Go to Firebase Console → Your Project → Settings → OAuth consent screen
2. Add authorized redirect URIs:
   - Development: `http://localhost:3000`
   - Production: `https://your-vercel-domain.vercel.app`
   - Add any other custom domains

3. The Google Sign-In popup should work on both development and production

---

## 🔄 File Upload Configuration

### Development
- Files are stored in `backEND/uploads/` directory
- Served via `/uploads` route

### Production (Render)
- ⚠️ **Important**: Render has ephemeral storage. Files uploaded will be lost after deployment/restart
- **Solution for Production**: Implement cloud storage
  - AWS S3
  - Google Cloud Storage
  - Cloudinary
  - Firebase Storage

Consider migrating file uploads to cloud storage for production reliability.

---

## ✅ Checklist Before Deploying

### Backend (Render)
- [ ] MongoDB connection string is valid
- [ ] JWT_SECRET is set to a strong, unique value
- [ ] Firebase Service Account Key is configured
- [ ] FRONTEND_URL is set to your Vercel domain
- [ ] CORS includes Vercel domain
- [ ] Node version is compatible (v16+)

### Frontend (Vercel)
- [ ] VITE_API_URL points to Render backend URL
- [ ] Firebase credentials are correct
- [ ] All localhost URLs are replaced with env variables
- [ ] Build completes successfully locally (`npm run build`)
- [ ] Environment variables are set on Vercel

### Google Auth
- [ ] Firebase project is created
- [ ] Google OAuth consent screen configured
- [ ] Redirect URIs include production domain

---

## 🐛 Troubleshooting

### Google Login Not Working
1. Check browser console for errors
2. Verify Firebase credentials in `.env`
3. Confirm redirect URIs in Firebase console
4. Check CORS policy on backend
5. Verify idToken is being sent correctly

### CORS Errors
1. Check backend CORS configuration includes frontend domain
2. Ensure credentials: true is set in both frontend and backend
3. Verify HTTP headers have correct origin

### File Upload Issues on Render
- Files persist during the same session but are lost after restart/redeploy
- Use cloud storage for persistent file storage

### MongoDB Connection Issues
- Verify connection string is correct
- Check IP whitelist on MongoDB Atlas
- Ensure credentials are URL-encoded if needed

---

## 📚 Useful Resources
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- Vite Docs: https://vitejs.dev/

---

## 🎯 Next Steps
1. Test Google login locally before deploying
2. Deploy backend first to Render
3. Update frontend with backend URL
4. Deploy frontend to Vercel
5. Test all features in production
