/* import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmailOTP(to: string, otp: string) {
  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    html: `<h2>Your OTP Code is: <b>${otp}</b></h2>`,
  });
}
  */

import axios from "axios";

export async function sendEmailOTP(to: string, otp: string) {
  try {
    const payload = {
      from: process.env.EMAIL_USER, // sender email
      to,
      subject: "Your Ashinity Real Estate OTP Code",
      html: `<h2>Your OTP Code is: <b>${otp}</b></h2>`,
    };

    const response = await axios.post(
      "https://chilesmailer.vercel.app/api/sendMail/email",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("📧 OTP email sent:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Email sending failed:", error.response?.data || error.message);
    throw new Error("Email sending failed");
  }
}
