import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMSOTP(phone: string, otp: string) {
  await client.messages.create({
    from: process.env.TWILIO_PHONE!,
    to: phone,
    body: `Your OTP code is: ${otp}`,
  });
}
