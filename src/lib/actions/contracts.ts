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

const externalContractSchema = z.object({
  supplierName: z.string().min(1, "Supplier name is required"),
  reference: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  value: z.string().optional(),
  status: z.enum(["ACTIVE", "PENDING", "ON_HOLD", "EXPIRED", "TERMINATED"]),
});

export async function addExternalContract(
  contractId: string,
  formData: FormData,
) {
  await requireManager();
  const data = externalContractSchema.parse({
    supplierName: formData.get("supplierName")?.toString() ?? "",
    reference: formData.get("reference")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    startDate: formData.get("startDate")?.toString() ?? "",
    endDate: formData.get("endDate")?.toString() ?? "",
    value: formData.get("value")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "ACTIVE",
  });

  await prisma.externalContract.create({
    data: {
      parentContractId: contractId,
      supplierName: data.supplierName,
      reference: data.reference || null,
      description: data.description || null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      value: data.value ? data.value : null,
      status: data.status,
    },
  });

  revalidatePath(`/contracts/${contractId}`);
}

export async function deleteExternalContract(
  contractId: string,
  externalContractId: string,
) {
  await requireManager();
  await prisma.externalContract.delete({ where: { id: externalContractId } });
  revalidatePath(`/contracts/${contractId}`);
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
