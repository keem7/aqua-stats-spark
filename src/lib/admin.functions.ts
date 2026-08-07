import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

type AdminSession = { admin?: string };

function sessionConfig() {
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

/** Constant-time-ish comparison using Web Crypto (works on edge runtimes). */
async function matches(input: string, expected: string): Promise<boolean> {
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

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = process.env["ADMIN_USERNAME"];
    const pass = process.env["ADMIN_PASSWORD"];
    if (!user || !pass) {
      return { ok: false as const, reason: "not-configured" as const };
    }

    const [userOk, passOk] = await Promise.all([
      matches(data.username.trim(), user.trim()),
      matches(data.password, pass),
    ]);
    if (!userOk || !passOk) {
      return { ok: false as const, reason: "invalid" as const };
    }

    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ admin: user });
    return { ok: true as const, reason: null };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const session = await useSession<AdminSession>(sessionConfig());
    await session.clear();
  } catch {
    // ignore — logging out of a broken session is still a logout
  }
  return { ok: true as const };
});

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const session = await useSession<AdminSession>(sessionConfig());
    return { admin: session.data.admin ?? null };
  } catch {
    // Never let a session/config problem crash the page — treat as signed out.
    return { admin: null };
  }
});
