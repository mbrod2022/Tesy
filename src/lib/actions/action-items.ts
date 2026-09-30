"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

const actionItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().optional(),
  ownerId: z.string().optional(),
  meetingId: z.string().optional(),
});

export async function createActionItem(contractId: string, formData: FormData) {
  await requireUser();
  const data = actionItemSchema.parse({
    description: formData.get("description")?.toString() ?? "",
    dueDate: formData.get("dueDate")?.toString() ?? "",
    ownerId: formData.get("ownerId")?.toString() ?? "",
    meetingId: formData.get("meetingId")?.toString() ?? "",
  });

  await prisma.actionItem.create({
    data: {
      contractId,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      ownerId: data.ownerId || null,
      meetingId: data.meetingId || null,
    },
  });

  revalidatePath(`/contracts/${contractId}`);
}

export async function updateActionItemStatus(
  contractId: string,
  actionItemId: string,
  status: "OPEN" | "IN_PROGRESS" | "DONE",
) {
  await requireUser();
  await prisma.actionItem.update({
    where: { id: actionItemId },
    data: { status },
  });
  revalidatePath(`/contracts/${contractId}`);
}

export async function deleteActionItem(contractId: string, actionItemId: string) {
  await requireUser();
  await prisma.actionItem.delete({ where: { id: actionItemId } });
  revalidatePath(`/contracts/${contractId}`);
}
