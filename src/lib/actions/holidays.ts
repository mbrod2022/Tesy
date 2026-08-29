"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager, requireUser } from "@/lib/auth-helpers";

const holidaySchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  type: z.enum(["ANNUAL_LEAVE", "SICK", "OTHER"]),
  notes: z.string().optional(),
});

export async function createHoliday(_prevState: unknown, formData: FormData) {
  const user = await requireUser();
  let data;
  try {
    data = holidaySchema.parse({
      startDate: formData.get("startDate")?.toString() ?? "",
      endDate: formData.get("endDate")?.toString() ?? "",
      type: formData.get("type")?.toString() ?? "ANNUAL_LEAVE",
      notes: formData.get("notes")?.toString() ?? "",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid input" };
    }
    throw error;
  }

  if (new Date(data.endDate) < new Date(data.startDate)) {
    return { error: "End date must be on or after the start date." };
  }

  await prisma.holiday.create({
    data: {
      userId: user.id,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      type: data.type,
      notes: data.notes || null,
      status: user.role === "ADMIN" || user.role === "MANAGER" ? "APPROVED" : "REQUESTED",
    },
  });

  revalidatePath("/holidays");
}

export async function setHolidayStatus(
  holidayId: string,
  status: "APPROVED" | "REJECTED",
) {
  await requireManager();
  await prisma.holiday.update({ where: { id: holidayId }, data: { status } });
  revalidatePath("/holidays");
}

export async function deleteHoliday(holidayId: string) {
  const user = await requireUser();
  const holiday = await prisma.holiday.findUnique({ where: { id: holidayId } });
  if (!holiday) return;
  if (holiday.userId !== user.id && user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error("You cannot cancel someone else's holiday.");
  }
  await prisma.holiday.delete({ where: { id: holidayId } });
  revalidatePath("/holidays");
}
