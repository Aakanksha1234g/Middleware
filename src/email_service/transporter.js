//This file is used to create a nodemailer transporter object for sending mails.


const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',     
    port:587,
    secure:false,
    auth: {user: 'my-account@gmail.com',pass:'16-bit-code'}
});

module.exports = {email};

