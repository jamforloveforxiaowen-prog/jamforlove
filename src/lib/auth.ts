import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface SessionUser {
  id: number;
  username: string;
  role: string;
  name: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function register(
  username: string,
  password: string,
  name: string,
  email: string
) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (existing) {
    return { error: "此帳號已被註冊" };
  }

  const passwordHash = await hashPassword(password);
  const result = await db
    .insert(users)
    .values({ username, passwordHash, name, email })
    .returning()
    .get();

  return { user: result };
}

export async function login(username: string, password: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (!user) {
    return { error: "帳號或密碼錯誤" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "帳號或密碼錯誤" };
  }

  const token = await createToken({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  });

  return { token, user };
}
