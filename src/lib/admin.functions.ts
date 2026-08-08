import { createServerFn } from "@tanstack/react-start";
import { credentialsMatch, openAdminSession } from "./admin-session.server";

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = process.env["ADMIN_USERNAME"];
    const pass = process.env["ADMIN_PASSWORD"];
    if (!user || !pass) {
      return { ok: false as const, reason: "not-configured" as const };
    }

    const [userOk, passOk] = await Promise.all([
      credentialsMatch(data.username.trim(), user.trim()),
      credentialsMatch(data.password, pass),
    ]);
    if (!userOk || !passOk) {
      return { ok: false as const, reason: "invalid" as const };
    }

    const session = await openAdminSession();
    await session.update({ admin: user });
    return { ok: true as const, reason: null };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const session = await openAdminSession();
    await session.clear();
  } catch {
    // ignore — logging out of a broken session is still a logout
  }
  return { ok: true as const };
});

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const session = await openAdminSession();
    return { admin: session.data.admin ?? null };
  } catch {
    // Never let a session/config problem crash the page — treat as signed out.
    return { admin: null };
  }
});
