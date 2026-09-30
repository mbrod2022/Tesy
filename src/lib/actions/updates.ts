"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

const updateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Update content is required"),
});

export async function createUpdate(contractId: string, formData: FormData) {
  const user = await requireUser();
  const data = updateSchema.parse({
    title: formData.get("title")?.toString() ?? "",
    content: formData.get("content")?.toString() ?? "",
  });

  await prisma.update.create({
    data: {
      contractId,
      title: data.title,
      content: data.content,
      authorId: user.id,
    },
  });

  revalidatePath(`/contracts/${contractId}`);
}

export async function deleteUpdate(contractId: string, updateId: string) {
  await requireUser();
  await prisma.update.delete({ where: { id: updateId } });
  revalidatePath(`/contracts/${contractId}`);
}
