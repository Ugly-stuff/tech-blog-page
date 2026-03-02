# Common Issues & Quick Fixes

## 🔴 Google Login Not Working

### Symptoms
- Google sign-in button appears but doesn't work
- Console error: "Invalid Google Token" or CORS errors
- Firebase popup not opening

### Solutions

1. **Check Firebase Configuration**
   ```javascript
   // Verify firebaseConfig in src/firebase.js
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
   };
   ```

2. **Verify OAuth Redirect URIs in Firebase**
   - Firebase Console → Project → Settings → OAuth consent screen
   - Add authorized redirect URIs:
     - `http://localhost:3000`
     - `https://your-vercel-domain.vercel.app`

3. **Check Backend Endpoint**
   - Verify `/auth/google` route exists in `server.js`
   - Check CORS allows frontend domain
   - Test with: `curl -X POST http://localhost:5000/auth/google -H "Content-Type: application/json" -d '{"idToken":"test"}'`

4. **Verify Environment Variables**
   ```bash
   # Frontend
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   
   # Backend
   FIREBASE_SERVICE_ACCOUNT_KEY=... or serviceAccountKey.json exists
   JWT_SECRET=...
   ```

---

## 🔴 CORS Errors

### Symptoms
- Console error: "Access to XMLHttpRequest blocked by CORS policy"
- Request shows as red in Network tab
- "No 'Access-Control-Allow-Origin' header"

### Solutions

1. **Check Backend CORS Configuration**
   ```javascript
   // In server.js
   const allowedOrigins = [
     "http://localhost:3000",
     "http://localhost:5173",
     "https://your-vercel-domain.vercel.app",
   ];
   ```

2. **Update FRONTEND_URL on Render**
   - Render Dashboard → Environment Variables
   - Set `FRONTEND_URL=https://your-vercel-domain.vercel.app`

3. **Test CORS Locally**
   ```bash
   # Backend running on 5000
   # Frontend running on 5173 (Vite default)
   # Should work without errors
   ```

---

## 🔴 Hardcoded localhost URLs in Frontend

### Symptoms
- Works in development, breaks in production
- API endpoints return 404 or CORS errors
- Production features don't work

### Solution
✅ **Already Fixed!** All localhost URLs replaced with:
```javascript
${import.meta.env.VITE_API_URL}
```

---

## 🔴 Files Disappear After Redeployment on Render

### Symptoms
- Uploaded images/videos work initially
- After Render restarts/redeploys, files are gone
- Users report missing media

### Cause
- Render has ephemeral file system (doesn't persist between restarts)

### Solution
**Use Cloud Storage (Required for Production)**
- AWS S3
- Google Cloud Storage
- Cloudinary
- Firebase Storage

Example with Cloudinary:
```javascript
// File upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  // Upload to Cloudinary instead of local disk
  // Return Cloudinary URL
});
```

---

## 🔴 MongoDB Connection Issues

### Symptoms
- "Cannot connect to MongoDB"
- "ECONNREFUSED"
- TimeoutError

### Solutions

1. **Verify Connection String Format**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```
   - Replace `username`, `password`, `cluster`, `dbname`
   - Special characters in password should be URL-encoded

2. **Check IP Whitelist (MongoDB Atlas)**
   - MongoDB Atlas → Network Access
   - Add 0.0.0.0/0 for development (Allow all IPs)
   - For production, add Render's static IP

3. **Test Connection**
   ```bash
   # Backend console should show "MongoDB Connected"
   ```

---

## 🔴 JWT/Authentication Errors

### Symptoms
- "Invalid token" or "unauthorized" errors
- Can't login/signup
- Session keeps logging out

### Solutions

1. **Check JWT_SECRET**
   ```bash
   # Backend .env
   JWT_SECRET=your_strong_secret_key_here
   # Must be same on frontend and backend
   ```

2. **Verify Token Storage**
   ```javascript
   // In browser localStorage should have:
   localStorage.getItem("token")
   localStorage.getItem("userId")
   localStorage.getItem("email")
   localStorage.getItem("username")
   ```

3. **Check Middleware**
   - Verify `authMiddleware.js` is correctly verifying tokens
   - Check Bearer token format: `Authorization: Bearer <token>`

---

## 🔴 "Cannot find module" Errors

### Symptoms
- Deployment fails with "Cannot find module"
- Works locally but fails on Render/Vercel

### Solutions

1. **Check Node Modules**
   ```bash
   # Backend
   cd backEND
   npm install
   
   # Frontend
   cd frontEND
   npm install
   ```

2. **Check Import Statements**
   - Use `.js` extension for ES6 modules: `import User from "./models/User.js"`
   - Check file exists and path is correct

3. **Check package.json**
   - All dependencies listed under `dependencies`
   - Node version compatible (v16+)

---

## 🔴 "Cannot resolve '@tailwindcss/postcss'"

### Symptoms
- Build fails with tailwind CSS errors
- `npm run build` fails

### Solution
```bash
# Install missing dependencies
cd frontEND
npm install @tailwindcss/postcss autoprefixer postcss tailwindcss

# Or reinstall all
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Verification Checklist

- [ ] Frontend loads without console errors
- [ ] Can signup/login with email
- [ ] Can login with Google
- [ ] Can create blogs with images
- [ ] Can like/comment on blogs
- [ ] Can delete blogs
- [ ] Can view profile
- [ ] Logout works correctly
- [ ] All API calls use environment variables
- [ ] No 404 or 500 errors in Console

---

## 📞 Quick Debug Commands

```bash
# Check if backend is running
curl http://localhost:5000/api/blogs

# Check if frontend build succeeds
cd frontEND && npm run build

# Test Google auth endpoint
curl -X POST http://localhost:5000/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'

# Check environment variables
echo $VITE_API_URL
echo $JWT_SECRET
```

---

## 📚 Support Documentation
- Backend Issues: Check `backEND/server.js` logs
- Frontend Issues: Check browser console (F12)
- Deployment Issues: Check Render/Vercel dashboard logs
