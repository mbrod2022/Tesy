"use client";

import { useActionState } from "react";
import { Field, TextInput, TextArea, Select, FormError } from "@/components/form";
import { PrimaryButton } from "@/components/ui";

export type ContractFormAction = (
  prevState: unknown,
  formData: FormData,
) => Promise<{ error?: string } | undefined>;

export type ContractFormValues = {
  reference?: string;
  name?: string;
  clientName?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  value?: string;
  status?: string;
};

export function ContractForm({
  action,
  managers,
  defaultValues,
  defaultManagerId,
  submitLabel,
}: {
  action: ContractFormAction;
  managers: { id: string; name: string }[];
  defaultValues?: ContractFormValues;
  defaultManagerId?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state?.error} />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Reference" htmlFor="reference">
          <TextInput
            id="reference"
            name="reference"
            required
            defaultValue={defaultValues?.reference}
            placeholder="e.g. CON-2026-014"
          />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={defaultValues?.status ?? "ACTIVE"}>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="ON_HOLD">On hold</option>
            <option value="EXPIRED">Expired</option>
            <option value="TERMINATED">Terminated</option>
          </Select>
        </Field>
      </div>

      <Field label="Contract name" htmlFor="name">
        <TextInput
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          placeholder="e.g. Grounds Maintenance - North Region"
        />
      </Field>

      <Field label="Client" htmlFor="clientName">
        <TextInput
          id="clientName"
          name="clientName"
          required
          defaultValue={defaultValues?.clientName}
          placeholder="e.g. Riverside Borough Council"
        />
      </Field>

      <Field label="Description" htmlFor="description">
        <TextArea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ""}
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Start date" htmlFor="startDate">
          <TextInput
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={defaultValues?.startDate}
          />
        </Field>
        <Field label="End date" htmlFor="endDate">
          <TextInput
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={defaultValues?.endDate}
          />
        </Field>
        <Field label="Contract value (£)" htmlFor="value">
          <TextInput
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.value}
          />
        </Field>
      </div>

      <Field label="Contract manager" htmlFor="contractManagerId">
        <Select
          id="contractManagerId"
          name="contractManagerId"
          defaultValue={defaultManagerId ?? ""}
        >
          <option value="">Unassigned</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.name}
            </option>
          ))}
        </Select>
      </Field>

      <PrimaryButton type="submit">
        {pending ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
