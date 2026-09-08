"use client";

import { useActionState } from "react";
import { Field, TextInput, TextArea, Select, FormError } from "@/components/form";
import { PrimaryButton } from "@/components/ui";

export type ContactFormAction = (
  prevState: unknown,
  formData: FormData,
) => Promise<{ error?: string } | undefined>;

export type ContactFormValues = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  organisation?: string | null;
  type?: string;
  notes?: string | null;
};

export function ContactForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: ContactFormAction;
  defaultValues?: ContactFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" htmlFor="name">
          <TextInput id="name" name="name" required defaultValue={defaultValues?.name} />
        </Field>
        <Field label="Type" htmlFor="type">
          <Select id="type" name="type" defaultValue={defaultValues?.type ?? "CLIENT"}>
            <option value="CLIENT">Client</option>
            <option value="SUBCONTRACTOR">Subcontractor</option>
            <option value="INTERNAL">Internal</option>
            <option value="OTHER">Other</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Email" htmlFor="email">
          <TextInput id="email" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <TextInput id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Job title" htmlFor="jobTitle">
          <TextInput id="jobTitle" name="jobTitle" defaultValue={defaultValues?.jobTitle ?? ""} />
        </Field>
        <Field label="Organisation" htmlFor="organisation">
          <TextInput
            id="organisation"
            name="organisation"
            defaultValue={defaultValues?.organisation ?? ""}
          />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes">
        <TextArea id="notes" name="notes" rows={3} defaultValue={defaultValues?.notes ?? ""} />
      </Field>

      <PrimaryButton type="submit">{pending ? "Saving..." : submitLabel}</PrimaryButton>
    </form>
  );
}
