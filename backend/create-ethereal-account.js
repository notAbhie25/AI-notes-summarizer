const nodemailer = require('nodemailer');

async function createTestAccount() {
    let testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal test account created');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
    console.log('SMTP Host:', testAccount.smtp.host);
    console.log('SMTP Port:', testAccount.smtp.port);
    console.log('Secure:', testAccount.smtp.secure);
}

createTestAccount();
