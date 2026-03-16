import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet, { contentSecurityPolicy } from "helmet";
import productRoutes from "./routes/productRoutes.js";
import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";

dotenv.config();

const app = express();
app.use(helmet({ contentSecurityPolicy: false })); // security middleware helping to protect your app from some well-known web vulnerabilities by setting appropriate HTTP headers
app.use(morgan("dev")); // HTTP request logger middleware for node.js
app.use(cors()); // CORS middleware to enable Cross-Origin Resource Sharing
app.use(express.json()); // built-in middleware function in Express. It parses incoming requests with JSON payloads and is based on body-parser. helps to get data from frontend
import path from "path";

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1, //specifies that each request consumes one token
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({ error: "Too Many Requests" });
      } else if (decision.reason.isBot) {
        res.status(403).json({ error: "Bot Access Denied" });
      } else {
        res.status(403).json({ error: "Forbidden" });
      }
      return;
    }
    //check for spoofed bots
    if (
      decision.results.some(
        (result) => result.reason.isBot() && result.reason.isSpoofed(),
      )
    ) {
      res.status(403).json({ error: "Spoofed Bot Detected" });
      return;
    }
    next();
  } catch (error) {
    console.log("Arcjet error: ", error);
    next(error);
  }
});

app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
<<<<<<< HEAD
  app.get("/*splat", (req, res) => {
=======
  app.use((req, res) => {
>>>>>>> 21e9bb4e43a660afcaab87b68372181f34555bfa
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

async function initDB() {
  try {
    await sql`
        CREATE TABLE IF NOT EXISTS products(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    console.log("database initialised successfully");
  } catch (error) {
    console.log("error initDB: ", error);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
