// Backend/Controllers/ContactUsController.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const handleContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `The customer ${name} wants to contact you `,
      text: message
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Message sent successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
