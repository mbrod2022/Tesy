"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo:
        typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(
        `/login?error=1${
          typeof callbackUrl === "string" && callbackUrl
            ? `&callbackUrl=${encodeURIComponent(callbackUrl)}`
            : ""
        }`,
      );
    }
    throw error;
  }
}
