// Simple email service for development/testing
// For production, use a proper email service like SendGrid, AWS SES, or Gmail

import nodemailer from 'nodemailer';

// Development email service (logs to console instead of sending real emails)
const createDevTransporter = () => {
  return {
    sendMail: async (mailOptions) => {
      console.log('\n📧 EMAIL WOULD BE SENT:');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Content:', mailOptions.html);
      console.log('📧 END EMAIL\n');
      return { messageId: 'dev-' + Date.now() };
    }
  };
};

// Production email service (Gmail)
const createProdTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Create transporter based on environment
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return createProdTransporter();
  } else {
    return createDevTransporter();
  }
};

export { createTransporter };
