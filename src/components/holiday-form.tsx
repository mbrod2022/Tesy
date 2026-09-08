"use client";

import { useActionState } from "react";
import { Field, TextInput, TextArea, Select, FormError } from "@/components/form";
import { PrimaryButton } from "@/components/ui";
import { createHoliday } from "@/lib/actions/holidays";

export function HolidayForm() {
  const [state, formAction, pending] = useActionState(createHoliday, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start date" htmlFor="startDate">
          <TextInput id="startDate" name="startDate" type="date" required />
        </Field>
        <Field label="End date" htmlFor="endDate">
          <TextInput id="endDate" name="endDate" type="date" required />
        </Field>
      </div>
      <Field label="Type" htmlFor="type">
        <Select id="type" name="type" defaultValue="ANNUAL_LEAVE">
          <option value="ANNUAL_LEAVE">Annual leave</option>
          <option value="SICK">Sick</option>
          <option value="OTHER">Other</option>
        </Select>
      </Field>
      <Field label="Notes" htmlFor="notes">
        <TextArea id="notes" name="notes" rows={2} />
      </Field>
      <PrimaryButton type="submit">{pending ? "Saving..." : "Request holiday"}</PrimaryButton>
    </form>
  );
}
