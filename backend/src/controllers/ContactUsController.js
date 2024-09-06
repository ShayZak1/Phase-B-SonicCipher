// src/controllers/ContactUsController.js
const nodemailer = require('nodemailer');

const handleContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Ensure this value is correct
        pass: process.env.EMAIL_PASS, // Ensure this value is correct
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `The customer ${name} wants to contact you`,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully', success: true });
  } catch (error) {
    // Enhanced logging to capture the exact error message
    console.error('Error sending email:', error);
    res.status(500).json({
      message: `Failed to send email: ${error.message}`,
      stack: error.stack, // Include stack trace for debugging
      success: false,
    });
  }
};

module.exports = { handleContactForm };
