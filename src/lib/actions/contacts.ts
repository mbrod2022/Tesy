"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  organisation: z.string().optional(),
  type: z.enum(["CLIENT", "SUBCONTRACTOR", "INTERNAL", "OTHER"]),
  notes: z.string().optional(),
});

function parseContactForm(formData: FormData) {
  return contactSchema.parse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    jobTitle: formData.get("jobTitle")?.toString() ?? "",
    organisation: formData.get("organisation")?.toString() ?? "",
    type: formData.get("type")?.toString() ?? "CLIENT",
    notes: formData.get("notes")?.toString() ?? "",
  });
}

export async function createContact(_prevState: unknown, formData: FormData) {
  await requireUser();
  let data;
  try {
    data = parseContactForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid input" };
    }
    throw error;
  }

  const contact = await prisma.contact.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      jobTitle: data.jobTitle || null,
      organisation: data.organisation || null,
      type: data.type,
      notes: data.notes || null,
    },
  });

  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(
  contactId: string,
  _prevState: unknown,
  formData: FormData,
) {
  await requireUser();
  let data;
  try {
    data = parseContactForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid input" };
    }
    throw error;
  }

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      jobTitle: data.jobTitle || null,
      organisation: data.organisation || null,
      type: data.type,
      notes: data.notes || null,
    },
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function deleteContact(contactId: string) {
  await requireUser();
  await prisma.contact.delete({ where: { id: contactId } });
  revalidatePath("/contacts");
  redirect("/contacts");
}
