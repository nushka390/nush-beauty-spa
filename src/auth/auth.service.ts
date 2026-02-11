import db from "../Drizzle/db";
import { sql, eq } from "drizzle-orm";
import { UsersTable } from "../Drizzle/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../mailer/mailer";

// Define user type
export type User = typeof UsersTable.$inferInsert;

// Secret key (store in .env)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register new user
export const registerUserService = async (
  data: Omit<User, "userID" | "isVerified" | "verificationCode">
) => {
  const hashedPassword = await bcrypt.hash(data.password as string, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 
try {

  await db.insert(UsersTable).values({
    ...data,
    password: hashedPassword,
    isVerified: false,
    verificationCode,
  });
  await sendEmail(
    data.email,
    "Verify Your Account",
    `Your verification code is: ${verificationCode}`,
    `Your verification code is: ${verificationCode}`,

  );

  return {
    message: "User registered successfully. Please verify your account.",
    verificationCode, // ⚠️ In production send via email/SMS
  };
} catch (error) {
  console.error("Error in registerUserService:", error);
  throw new Error("Failed to register user");
}};

// Get user by email
export const getUserByEmailService = async (email: string) => {
  return await db.query.UsersTable.findFirst({
    where: sql`${UsersTable.email} = ${email}`,
  });
};

// Verify user
export const verifyUserService = async (email: string, code: string) => {
  const user = await db.query.UsersTable.findFirst({
    where: sql`${UsersTable.email} = ${email}`,
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.verificationCode !== code) {
    throw new Error("Invalid verification code");
  }

  await db
    .update(UsersTable)
    .set({ isVerified: true, verificationCode: null })
    .where(eq(UsersTable.email, email));

  return { message: "User verified successfully" };
};


export const loginUserService = async (email: string, password: string) => {
  const user = await db.query.UsersTable.findFirst({
    where: sql`${UsersTable.email} = ${email}`,
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
    throw new Error("User not verified");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // Generate JWT
  const token = jwt.sign(
    {
      userID: user.userID,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    message: "Login successful",
    token,
    user: {
      userID: user.userID,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
};
