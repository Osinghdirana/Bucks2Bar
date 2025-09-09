const express = require("express");
const bodyParser = require("body-parser");
const { Resend } = require("resend");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Resend
const resend = new Resend("your-resend-api-key"); // Replace with your Resend API key

// Endpoint to send email
app.post("/send-email", async (req, res) => {
    const { email, chartImage } = req.body;

    if (!email || !chartImage) {
        return res.status(400).json({ error: "Email and chart image are required." });
    }
    // Create a transporter object using Resend as the SMTP server
    const transporter = nodemailer.createTransport({
        host: "smtp.resend.com", // Resend SMTP server
        port: 587,
        secure: false, // Use TLS
        auth: {
            user: "resend", // Replace with your Resend API key
            pass: "re_W787riHx_MmENQsoDBZpYcgZEH4Uwpnjg", // Replace with your Resend API key
        },
    });

    // Set up email options
    const mailOptions = {
        from: "onboarding@resend.dev", // Replace with your verified sender email
        to: email,
        subject: "Your Chart Image",
        html: "<p>Please find your chart image attached.</p>",
        attachments: [
            {
                filename: "chart.png",
                content: chartImage.split(",")[1], // Base64 image data
                encoding: "base64",
            },
        ],
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ error: "Failed to send email." });
        }
        console.log("Email sent:", info.response);
        res.status(200).json({ message: "Email sent successfully!" });
    });
  
    console.log("SEND EMAIL WORKS!", { email, chartImage });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});