"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

const meetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  meetingDate: z.string().min(1, "Meeting date is required"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

function toArray(value: FormDataEntryValue[] | string | null) {
  if (!value) return [];
  return Array.isArray(value) ? value.map(String) : [value];
}

export async function createMeeting(contractId: string, formData: FormData) {
  const user = await requireUser();
  const data = meetingSchema.parse({
    title: formData.get("title")?.toString() ?? "",
    meetingDate: formData.get("meetingDate")?.toString() ?? "",
    location: formData.get("location")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
  });

  const staffAttendeeIds = toArray(formData.getAll("staffAttendeeIds"));
  const contactAttendeeIds = toArray(formData.getAll("contactAttendeeIds"));

  await prisma.meeting.create({
    data: {
      contractId,
      title: data.title,
      meetingDate: new Date(data.meetingDate),
      location: data.location || null,
      notes: data.notes || null,
      createdById: user.id,
      staffAttendees: { connect: staffAttendeeIds.map((id) => ({ id })) },
      contactAttendees: { connect: contactAttendeeIds.map((id) => ({ id })) },
    },
  });

  revalidatePath(`/contracts/${contractId}`);
  revalidatePath("/meetings");
}

export async function deleteMeeting(contractId: string, meetingId: string) {
  await requireUser();
  await prisma.meeting.delete({ where: { id: meetingId } });
  revalidatePath(`/contracts/${contractId}`);
  revalidatePath("/meetings");
}
