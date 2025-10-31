require('dotenv').config();
const emailService = require('./services/emailService').default;

async function testEmail() {
  console.log('Testing email service connection...');
  const isConnected = await emailService.verifyConnection();
  
  if (isConnected) {
    console.log('Email service connected successfully!');
    
    const testEmailAddress = process.env.EMAIL_USER; // Or any other email for testing
    const testUserName = 'Test User';
    const testResetUrl = 'http://localhost:3000/reset-password?token=TEST_TOKEN';
    
    if (testEmailAddress) {
      console.log(`Attempting to send a test password reset email to ${testEmailAddress}...`);
      const emailSent = await emailService.sendPasswordResetEmail(
        testEmailAddress,
        testUserName,
        testResetUrl
      );
      
      if (emailSent) {
        console.log('✅ Test password reset email sent successfully!');
      } else {
        console.error('❌ Failed to send test password reset email.');
      }
    } else {
      console.warn('⚠️ EMAIL_USER is not set in .env. Cannot send test email without a recipient.');
      console.warn('   Please set EMAIL_USER in your .env file to test email sending.');
    }
  } else {
    console.error('❌ Email service connection failed. Please check your .env configuration.');
    console.error('   Ensure EMAIL_USER and EMAIL_PASS are correctly set.');
    console.error('   For Gmail, ensure you are using an App Password, not your regular password.');
    console.error('   Refer to NODEMAILER_SETUP.md for detailed instructions.');
  }
}

testEmail();
