require("dotenv").config(); // Load environment variables from the .env file to keep sensitive data secure.
const express = require("express");
const bodyParser = require("body-parser");
const { Resend } = require("resend");
const cors = require("cors");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT || 3000; // Use the port specified in .env or default to 3000 if not provided.

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || "*", // Restrict CORS to the allowed origin specified in .env or allow all origins by default.
}));
app.use(bodyParser.json({ limit: "1mb" })); // Parse incoming JSON requests and limit the payload size to 1MB to prevent large payload attacks.
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data with extended syntax for rich objects and arrays.

// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Set the time window to 15 minutes.
    max: 100, // Allow a maximum of 100 requests per IP within the time window to prevent abuse.
    message: { error: "Too many requests, please try again later." }, // Custom error message for rate limit violations.
});

// Apply rate limiter to the /send-email endpoint
app.use("/send-email", limiter); // Protect the /send-email endpoint from abuse by applying the rate limiter.

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY); // Initialize Resend with the API key stored in the .env file for secure email sending.

// Endpoint to get dummy financial data
app.get("/get-data", (req, res) => {
    const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];

    const financialData = months.reduce((acc, month) => {
        const expenses = Math.floor(Math.random() * (800 - 200 + 1)) + 200; // Random value between 200 and 800
        const income = Math.floor(Math.random() * (1000 - (expenses + 1) + 1)) + (expenses + 1); // Random value greater than expenses and up to 1000
        
        acc[month] = {
            income: income,
            expenses: expenses
        };
        return acc;
    }, {});

    res.status(200).json({ data: financialData });
});

// Endpoint to send email
app.post("/send-email", async (req, res) => {
    const { email, chartImage } = req.body;

    // Validate inputs
    if (!email || !chartImage) {
        return res.status(400).json({ error: "Email and chart image are required." }); // Ensure both email and chart image are provided.
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to validate the email format.
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address." }); // Return an error if the email format is invalid.
    }

    // Validate chart image format
    if (!chartImage.startsWith("data:image/png;base64,")) {
        return res.status(400).json({ error: "Invalid chart image format." }); // Ensure the chart image is a valid base64-encoded PNG.
    }

    // Create a transporter object using Resend as the SMTP server
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // Use the SMTP host specified in the .env file.
        port: parseInt(process.env.SMTP_PORT, 10), // Use the SMTP port specified in the .env file and parse it as an integer.
        secure: process.env.SMTP_SECURE === "true", // Use TLS if specified as true in the .env file.
        auth: {
            user: process.env.SMTP_USER, // Use the SMTP username from the .env file.
            pass: process.env.SMTP_PASS, // Use the SMTP password from the .env file.
        },
    });

    // Set up email options
    const mailOptions = {
        from: process.env.FROM_EMAIL, // Use the verified sender email address from the .env file.
        to: email, // The recipient's email address provided in the request body.
        subject: "Your Chart Image", // Subject of the email.
        html: "<p>Please find your chart image attached.</p>", // HTML content of the email body.
        attachments: [
            {
                filename: "chart.png", // Name of the attached file.
                content: chartImage.split(",")[1], // Extract the base64-encoded image data from the chartImage string.
                encoding: "base64", // Specify the encoding format as base64.
            },
        ],
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error); // Log the error if email sending fails.
            return res.status(500).json({ error: "Failed to send email." }); // Return a 500 error response to the client.
        }
        console.log("Email sent:", info.response); // Log the success response if the email is sent successfully.
        res.status(200).json({ message: "Email sent successfully!" }); // Return a success response to the client.
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`); // Log the server's running status and port.
});