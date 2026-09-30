"use client";

import { useActionState } from "react";
import { Field, TextInput, FormError } from "@/components/form";
import { PrimaryButton } from "@/components/ui";
import { changePasswordAction } from "@/lib/actions/auth";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <Field label="New password" htmlFor="newPassword">
        <TextInput
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoFocus
        />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword">
        <TextInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
        />
      </Field>
      <PrimaryButton type="submit">
        {pending ? "Saving..." : "Set new password"}
      </PrimaryButton>
    </form>
  );
}
