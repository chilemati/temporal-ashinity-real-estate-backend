import prisma from "../prismaClient";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { generateOTP, otpExpiry } from "../utils/otp";
import { sendEmailOTP } from "./email.service";
import { sendSMSOTP } from "./sms.service";
import cloudinary from "../utils/cloudinary";



// Define interfaces for expected input data
interface RegisterUserData {
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  phone?: string;
}

interface LoginUserData {
  email: string;
  password?: string;
}

// REGISTER USER
export async function register(data: { email: string,phone?: string }) {
  const exists = await prisma.user.findUnique({ where: { email: data.email }});
  if (exists) throw new Error("Email already registered");
  if(data.phone) {
    const existsPhone = await prisma.user.findUnique({ where: { phone: data.phone }});
    if (existsPhone) throw new Error("Phone number used by another user");

  }

  const otp = generateOTP();

  const user = await prisma.user.create({
    data: {
      email: data.email,
      emailOTP: otp,
      otpExpiresAt: otpExpiry()
    }
  });

  await sendEmailOTP(data.email, otp);

  return {
    success: true,
    message: "OTP sent for verification",
    user
  };
}

// resend otp

export async function resendEmailOTP(data: { email: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  // 1️⃣ User does NOT exist → cannot send OTP
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  // 2️⃣ If OTP still valid → do not resend
  if (user.otpExpiresAt && user.otpExpiresAt > now) {
    return {
      success: false,
      message: "OTP already sent. Please wait before requesting a new one.",
      user,
    };
  }

  // 3️⃣ OTP expired → generate new OTP
  const newOTP = generateOTP();

  const updatedUser = await prisma.user.update({
    where: { email: data.email },
    data: {
      emailOTP: newOTP,
      otpExpiresAt: otpExpiry(),
    }
  });
   
  try {
    
    let resp = await sendEmailOTP(data.email, newOTP);
    console.log("email sent");
     console.log(resp);
  
    return {
      success: true,
      message: "New OTP sent",
      user: updatedUser,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
      user: {},
    };
    
  }
}



// LOGIN USER
export async function loginSevice(data: { email: string; password?: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email }});

  if (!user) throw new Error("User not found");

  // If password is provided, attempt password login
  if (data.password) {
    if (!user.password) {
      // User does not have a password
      throw new Error("This account does not use password login. Use OTP login.");
    }

    const valid = await comparePassword(data.password, user.password);
    if (!valid) throw new Error("Invalid password");

    // Email must be verified
    if (!user.emailVerified) throw new Error("Email not verified");

    const token = signToken({ id: user.id });

    return {
      success: true,
      type: "password_login",
      token,
      user
    };
  }

  // No password → send OTP for login
  const otp = generateOTP();

  await prisma.user.update({
    where: { email: data.email },
    data: {
      emailOTP: otp,
      otpExpiresAt: otpExpiry()
    }
  });

  // Send OTP email
  await sendEmailOTP(data.email, otp);

  return {
    success: true,
    type: "otp_sent",
    message: "OTP sent to email for login"
  };
}



// VERIFY EMAIL OTP
export async function verifyLoginOTP(email: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) throw new Error("User not found");

  if (user.emailOTP !== otp) throw new Error("Invalid OTP");
  if (user.otpExpiresAt! < new Date()) throw new Error("OTP expired");

  // Mark email verified if not already
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      emailOTP: null,
      otpExpiresAt: null
    }
  });

  const token = signToken({ id: updatedUser.id });

  return {
    type: "otp_login",
    token,
    user: updatedUser
  };
}






export async function updateUserProfileByEmail(email: string, data: any) {
  const updateData: any = {};
    console.log(email,data);
  // Update only provided fields
  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.nin !== undefined) updateData.nin = data.nin;

  // Handle avatar upload only if base64 is provided
  if (data.avatar) {
    try {
      const upload = await cloudinary.uploader.upload(data.avatar, {
      folder: "users-ashinity",
    });
   
    updateData.avatar = upload.secure_url;
    } catch (error) {
       throw error; // pass error to controller
    }
  }

  // Update user by email
  return prisma.user.update({
    where: { email },
    data: updateData,
  });
}






// FORGOT PASSWORD → SEND OTP
export async function handleForgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) throw new Error("User not found");

  if(user.password === null || user.password === "" || user.password === undefined) {
    return {status: false, message: "User has only OTP login"}
  }else{

    const otp = generateOTP();
  
    await prisma.user.update({
      where: { email },
      data: {
        emailOTP: otp,
        otpExpiresAt: otpExpiry()
      }
    });
  
      try {
          await sendEmailOTP(email, otp);
          // console.log(`Email sent successfully to ${email}`);
      } catch (emailError) {
          // console.error("FAILED TO SEND EMAIL OTP:", emailError); // THIS LOG IS KEY
          throw new Error("Failed to send verification email. Please try again later.");
      }
      return {status: true, message: "OTP sent to your email"}
  }


}



// RESET PASSWORD
export async function resetPassword(email: string, otp: string, newPass: string) {
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) throw new Error("User not found");

  if (user.emailOTP !== otp) throw new Error("Invalid OTP");
  if (user.otpExpiresAt! < new Date()) throw new Error("OTP expired");

  const hashed = await hashPassword(newPass);

  return prisma.user.update({
    where: { email },
    data: {
      password: hashed,
      emailOTP: null,
      otpExpiresAt: null
    }
  });
}


// LOGIN WITH GOOGLE
export async function loginWithGoogle(googleId: string, email: string, fullname: string) {
  let user = await prisma.user.findUnique({ where: { googleId }});

  const [firstName, ...rest] = fullname.split(" ");
  const lastName = rest.join(" ") || "";

  if (!user) {
    user = await prisma.user.upsert({
      where: { email },
      update: { googleId },
      create: {
        googleId,
        email,
        firstName,
        lastName,
        emailVerified: true
      }
    });
  }

  const token = signToken({ id: user.id });
  return { token, user };
}



// SEND PHONE OTP (SMS)
export async function sendPhoneOTP(userId: string, phone: string) {
  const otp = generateOTP();

  await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      phone,
      phoneOTP: otp,
      otpExpiresAt: otpExpiry()
    }
  });

  // SEND SMS USING TWILIO
  await sendSMSOTP(phone, otp);

  return true;
}


// VERIFY PHONE OTP
export async function verifyPhoneOTP(userId: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) }});
  if (!user) throw new Error("User not found");

  if (user.phoneOTP !== otp) throw new Error("Invalid OTP");
  if (user.otpExpiresAt! < new Date()) throw new Error("OTP expired");

  return prisma.user.update({
    where: { id: Number(userId) },
    data: {
      phoneVerified: true,
      phoneOTP: null,
      otpExpiresAt: null
    }
  });
}
