import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password
  },
});

export async function sendMail(to: string, subject: string, text: string, html?: string) {
  await transporter.sendMail({
    from: `"Hackathon App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}
