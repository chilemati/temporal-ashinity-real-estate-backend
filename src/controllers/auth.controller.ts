import { Request, Response } from "express";
import * as auth from "../services/auth.service";

export async function register(req: Request, res: Response) {
  try {
    const user = await auth.register(req.body);
    res.json({ success: true, message: "OTP sent to email", user:{firstName:user.user.firstName,lastName:user.user.lastName,email:user.user.email, id: user.user.id,emailVerified:user.user.emailVerified, phoneVerified:user.user.phoneVerified} });
  } catch (err: unknown) {
   // Safely check if the caught error is an instance of the native Error class
    if (err instanceof Error) {
      res.status(400).json({ error: "An error occured,pleae try again" });
    } else {
      // Handle cases where the error is not a standard Error object (e.g., a thrown string or number)
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}

export async function resendOTPController(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const result = await auth.resendEmailOTP({ email });

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.json({
      success: true,
      message: result.message,
    });

  } catch (err: any) {
    return res.status(400).json({ error: "Failed to send OTP" });
  }
}


export async function verifyEmail(req: Request, res: Response) {
  try {
    const user = await auth.verifyLoginOTP(req.body.email, req.body.otp);
    res.json({ success: true, message: "Email verified",...user });
  } catch (err: unknown) {
   // Safely check if the caught error is an instance of the native Error class
    if (err instanceof Error) {
      res.status(400).json({ error: "An error occured,pleae try again" });
    } else {
      // Handle cases where the error is not a standard Error object (e.g., a thrown string or number)
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}

export async function login(req: Request, res: Response) {

  try {
    const data = await auth.loginSevice(req.body);
    res.json({ success: true, data });
  }catch (err: unknown) {
   // Safely check if the caught error is an instance of the native Error class
    if (err instanceof Error) {
      res.status(400).json({ error: "An error occured,pleae try again" });
    } else {
      // Handle cases where the error is not a standard Error object (e.g., a thrown string or number)
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const data = await auth.handleForgotPassword(req.body.email);
    res.json({ success: data.status, message: data.message });
  } catch (err: unknown) {
   // Safely check if the caught error is an instance of the native Error class
    if (err instanceof Error) {
      res.status(400).json({ error: "An error occured,pleae try again" });
    } else {
      // Handle cases where the error is not a standard Error object (e.g., a thrown string or number)
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const user = await auth.resetPassword(
      req.body.email,
      req.body.otp,
      req.body.newPassword
    );
    res.json({ success: true, message: "Password reset successful" });
  } catch (err: unknown) {
   // Safely check if the caught error is an instance of the native Error class
    if (err instanceof Error) {
      res.status(400).json({ error: "An error occured,pleae try again" });
    } else {
      // Handle cases where the error is not a standard Error object (e.g., a thrown string or number)
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    const data = await auth.loginWithGoogle(
      req.body.googleId,
      req.body.email,
      req.body.fullname
    );
    res.json({ success: true, ...data });
  } catch (err: unknown) {
   // Safely check if the caught error is an instance of the native Error class
    if (err instanceof Error) {
      res.status(400).json({ error: "An error occured,pleae try again" });
    } else {
      // Handle cases where the error is not a standard Error object (e.g., a thrown string or number)
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}

export async function sendPhoneOTP(req: Request, res: Response) {
  try {
    await auth.sendPhoneOTP(req.body.userId, req.body.phone);
    res.json({ success: true, message: "OTP sent to phone" });
  } catch (err: unknown) {
   // Safely check if the caught error is an instance of the native Error class
    if (err instanceof Error) {
      res.status(400).json({ error: "An error occured,pleae try again" });
    } else {
      // Handle cases where the error is not a standard Error object (e.g., a thrown string or number)
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}

export async function verifyPhoneOTP(req: Request, res: Response) {
  try {
    const user = await auth.verifyPhoneOTP(req.body.userId, req.body.otp);
    res.json({ success: true, message: "Phone verified", user });
  } catch (err: unknown) {
   // Safely check if the caught error is an instance of the native Error class
    if (err instanceof Error) {
      res.status(400).json({ error: "An error occured,pleae try again" });
    } else {
      // Handle cases where the error is not a standard Error object (e.g., a thrown string or number)
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}


export async function updateProfile(req: Request, res: Response) {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    // Update user profile using service
    const updatedUser = await auth.updateUserProfileByEmail(email, req.body);

    return res.json({
      success: true,
      message: "Profile updated successfully",
      // user: {
      //   id: updatedUser.id,
      //   email: updatedUser.email,
      //   firstName: updatedUser.firstName,
      //   lastName: updatedUser.lastName,
      //   phone: updatedUser.phone,
      //   nin: updatedUser.nin,
      //   avatar: updatedUser.avatar,
      // },
      user:updatedUser
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(400).json({ error: "An error occured,pleae try again",message:err });
    } else {
      return res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}



