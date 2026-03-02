import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let adminInstance = null;
try {
    let serviceAccount = null;
    
    // Try to load from environment variable first (production - Render, Heroku, etc.)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            console.log("Firebase Admin: Using service account from environment variable");
        } catch (err) {
            console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env variable:", err.message);
        }
    }
    
    // Fall back to file-based approach (development)
    if (!serviceAccount) {
        const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
        if (fs.existsSync(serviceAccountPath)) {
            serviceAccount = JSON.parse(
                fs.readFileSync(serviceAccountPath, "utf8")
            );
            console.log("Firebase Admin: Using service account from file");
        } else {
            console.warn("serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT_KEY env variable not set — Firebase Admin not initialized.");
        }
    }
    
    // Initialize Firebase Admin with the service account
    if (serviceAccount) {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        adminInstance = admin;
        console.log("Firebase Admin initialized successfully");
    }
} catch (err) {
    console.warn("Failed to initialize Firebase Admin:", err.message);
}

export default adminInstance;