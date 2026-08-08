import { useSession } from "@tanstack/react-start/server";

export type AdminSession = { admin?: string };

export function getAdminSessionConfig() {
  const password = process.env["SESSION_SECRET"];
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET is missing or too short (needs 32+ characters)");
  }
  return {
    password,
    name: "kaizema-admin",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, sameSite: "lax" as const, path: "/" },
  };
}

export async function credentialsMatch(input: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(input)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < x.length; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function openAdminSession() {
  return useSession<AdminSession>(getAdminSessionConfig());
}