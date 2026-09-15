import nodemailer from 'nodemailer';

import {
  getVerificationEmailTemplate,
  getEmailAlreadyVerifiedTemplate,
  getEmailVerifiedTemplate,
  getLinkExpired,
  getOtpEmailTemplate,
} from '../../public/js/email-template.js';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async ({ email, token }) => {
  const verificationUrl = `https://api.synzy.in/api/auth/verify-email/${token}`;

  const mailOptions = {
    from: `"TC-SA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '@noreply Verification link from TC-SA',
    html: getVerificationEmailTemplate(verificationUrl),
  };

  await transporter.sendMail(mailOptions);
};

export const sendOtpToEmail = async ({ email, otp }) => {
  const mailOptions = {
    from: `"TC-SA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '@noreply Verification code for TC-SA registration',
    html: getOtpEmailTemplate(otp),
  };

  await transporter.sendMail(mailOptions);
};

export const emailTemplates = {
  alreadyVerified: getEmailAlreadyVerifiedTemplate,
  verified: getEmailVerifiedTemplate,
  expired: getLinkExpired,
};
