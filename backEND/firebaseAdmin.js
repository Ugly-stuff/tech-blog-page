import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let adminInstance = null;
try {
    const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(
            fs.readFileSync(serviceAccountPath, "utf8")
        );

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        adminInstance = admin;
    } else {
        console.warn("serviceAccountKey.json not found — Firebase Admin not initialized.");
    }
} catch (err) {
    console.warn("Failed to initialize Firebase Admin:", err.message);
}

export default adminInstance;