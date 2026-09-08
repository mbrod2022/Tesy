"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager, requireUser } from "@/lib/auth-helpers";

const contractSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  name: z.string().min(1, "Name is required"),
  clientName: z.string().min(1, "Client name is required"),
  type: z.enum(["COLLECTIONS", "HWRC", "DEPOT_OFFICE", "OTHER"]),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  status: z.enum(["ACTIVE", "PENDING", "ON_HOLD", "EXPIRED", "TERMINATED"]),
  contractManagerId: z.string().optional(),
});

function parseContractForm(formData: FormData) {
  const raw = {
    reference: formData.get("reference")?.toString() ?? "",
    name: formData.get("name")?.toString() ?? "",
    clientName: formData.get("clientName")?.toString() ?? "",
    type: formData.get("type")?.toString() ?? "OTHER",
    description: formData.get("description")?.toString() ?? "",
    startDate: formData.get("startDate")?.toString() ?? "",
    endDate: formData.get("endDate")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "ACTIVE",
    contractManagerId: formData.get("contractManagerId")?.toString() ?? "",
  };
  return contractSchema.parse(raw);
}

export async function createContract(_prevState: unknown, formData: FormData) {
  await requireManager();
  let data;
  try {
    data = parseContractForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid input" };
    }
    throw error;
  }

  let contract;
  try {
    contract = await prisma.contract.create({
      data: {
        reference: data.reference,
        name: data.name,
        clientName: data.clientName,
        type: data.type,
        description: data.description || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status,
        contractManagerId: data.contractManagerId || null,
      },
    });
  } catch {
    return { error: "A contract with that reference already exists." };
  }

  revalidatePath("/contracts");
  redirect(`/contracts/${contract.id}`);
}

export async function updateContract(
  contractId: string,
  _prevState: unknown,
  formData: FormData,
) {
  await requireManager();
  let data;
  try {
    data = parseContractForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid input" };
    }
    throw error;
  }

  try {
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        reference: data.reference,
        name: data.name,
        clientName: data.clientName,
        type: data.type,
        description: data.description || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status,
        contractManagerId: data.contractManagerId || null,
      },
    });
  } catch {
    return { error: "A contract with that reference already exists." };
  }

  revalidatePath("/contracts");
  revalidatePath(`/contracts/${contractId}`);
  redirect(`/contracts/${contractId}`);
}

export async function deleteContract(contractId: string) {
  await requireManager();
  await prisma.contract.delete({ where: { id: contractId } });
  revalidatePath("/contracts");
  redirect("/contracts");
}

export async function linkContact(
  contractId: string,
  formData: FormData,
) {
  await requireUser();
  const contactId = formData.get("contactId")?.toString();
  const role = formData.get("role")?.toString() ?? "";
  if (!contactId) return;

  await prisma.contractContact.upsert({
    where: { contractId_contactId: { contractId, contactId } },
    update: { role: role || null },
    create: { contractId, contactId, role: role || null },
  });

  revalidatePath(`/contracts/${contractId}`);
}

export async function unlinkContact(contractId: string, contactId: string) {
  await requireUser();
  await prisma.contractContact.delete({
    where: { contractId_contactId: { contractId, contactId } },
  });
  revalidatePath(`/contracts/${contractId}`);
}
