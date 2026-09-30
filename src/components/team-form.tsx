"use client";

import { useActionState } from "react";
import { Field, TextInput, Select, FormError } from "@/components/form";
import { PrimaryButton } from "@/components/ui";
import { createTeamMember } from "@/lib/actions/users";

export function TeamForm() {
  const [state, formAction, pending] = useActionState(createTeamMember, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      {state?.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Team member created.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" htmlFor="name">
          <TextInput id="name" name="name" required />
        </Field>
        <Field label="Email" htmlFor="email">
          <TextInput id="email" name="email" type="email" required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Temporary password" htmlFor="password">
          <TextInput id="password" name="password" type="text" required minLength={8} />
        </Field>
        <Field label="Role" htmlFor="role">
          <Select id="role" name="role" defaultValue="STAFF">
            <option value="STAFF">Staff</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </Field>
      </div>
      <Field label="Job title" htmlFor="jobTitle">
        <TextInput id="jobTitle" name="jobTitle" />
      </Field>
      <PrimaryButton type="submit">{pending ? "Saving..." : "Add team member"}</PrimaryButton>
    </form>
  );
}
