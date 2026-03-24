import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.EMAIL_SERVER_PORT ? Number(process.env.EMAIL_SERVER_PORT) : 3000;

// Production CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || false
    : true, // Allow all in development
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit payload size

// Check if we have SMTP credentials, otherwise use test mode
const hasSMTPCredentials = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

let transporter;
if (hasSMTPCredentials) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add connection timeout and retry settings
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });

  // Verify SMTP connection on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ SMTP connection failed:", error);
    } else {
      console.log("✅ SMTP connection successful");
    }
  });
}

// Rate limiting (simple in-memory implementation)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // Max 10 emails per window per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];

  // Remove old requests outside the window
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (validRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }

  validRequests.push(now);
  rateLimit.set(ip, validRequests);
  return true;
}

// Input validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, 10000); // Limit length
}

app.post("/api/send-booking-confirmation", async (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

  // Rate limiting check
  if (!checkRateLimit(clientIP)) {
    console.warn(`⚠️ Rate limit exceeded for IP: ${clientIP}`);
    return res.status(429).json({
      message: "Too many requests. Please try again later.",
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
    });
  }

  const { to, subject, body, from } = req.body;

  // Input validation
  if (!to || !subject || !body) {
    return res.status(400).json({
      message: "Missing required fields: to, subject, body."
    });
  }

  if (!validateEmail(to)) {
    return res.status(400).json({
      message: "Invalid recipient email address."
    });
  }

  // Sanitize inputs
  const sanitizedTo = sanitizeInput(to);
  const sanitizedSubject = sanitizeInput(subject);
  const sanitizedBody = sanitizeInput(body);
  const sanitizedFrom = from ? sanitizeInput(from) : null;

  try {
    if (hasSMTPCredentials && transporter) {
      // Send real email
      const mailOptions = {
        from: sanitizedFrom || process.env.EMAIL_FROM,
        to: sanitizedTo,
        subject: sanitizedSubject,
        text: sanitizedBody,
        // Add some headers for better deliverability
        headers: {
          'X-Mailer': 'Bokang Utica Hair Salon Email Server',
          'List-Unsubscribe': '<mailto:unsubscribe@bokangutica.com>'
        }
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${sanitizedTo}: ${sanitizedSubject}`);
      return res.status(200).json({ message: "Email sent successfully." });
    } else {
      // Test mode - just log the email
      console.log("📧 TEST MODE - Email would be sent:");
      console.log(`To: ${sanitizedTo}`);
      console.log(`Subject: ${sanitizedSubject}`);
      console.log(`From: ${sanitizedFrom || process.env.EMAIL_FROM || 'test@local'}`);
      console.log(`Body:\n${sanitizedBody}`);
      console.log("--- End of test email ---");

      return res.status(200).json({
        message: "Test mode: Email logged successfully (no SMTP configured).",
        testMode: true
      });
    }
  } catch (err) {
    console.error("Email send failed:", err);
    return res.status(500).json({
      message: "Failed to send email.",
      error: process.env.NODE_ENV === 'development' ? err?.toString() : 'Internal server error'
    });
  }
});

app.get("/api/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    smtp: {
      configured: hasSMTPCredentials,
      connected: false
    }
  };

  // Test SMTP connection if configured
  if (hasSMTPCredentials && transporter) {
    try {
      await transporter.verify();
      health.smtp.connected = true;
    } catch (err) {
      health.smtp.connected = false;
      health.smtp.error = err.message;
    }
  }

  const statusCode = health.smtp.configured && !health.smtp.connected ? 503 : 200;
  res.status(statusCode).json(health);
});

app.listen(port, () => {
  console.log(`🚀 Email server running on http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);

  if (hasSMTPCredentials) {
    console.log("📧 Production email mode: SMTP credentials configured");
    console.log(`   Host: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT || 587}`);
    console.log(`   From: ${process.env.EMAIL_FROM || 'default'}`);
  } else {
    console.log("🧪 Test mode: No SMTP credentials - emails will be logged only");
    console.log("   To enable real emails, add EMAIL_HOST, EMAIL_USER, EMAIL_PASS to .env");
  }

  console.log("🔗 Health check: GET /api/health");
  console.log("📨 Send email: POST /api/send-booking-confirmation");
});