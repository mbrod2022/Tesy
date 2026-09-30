import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/change-password-form";

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          {session.user.mustChangePassword
            ? "Set a new password"
            : "Change your password"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {session.user.mustChangePassword
            ? "You're signed in with a temporary password. Choose a new one to continue."
            : "Update the password for your account."}
        </p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
