"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]),
  jobTitle: z.string().optional(),
});

export async function createTeamMember(_prevState: unknown, formData: FormData) {
  await requireAdmin();
  let data;
  try {
    data = userSchema.parse({
      name: formData.get("name")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
      role: formData.get("role")?.toString() ?? "STAFF",
      jobTitle: formData.get("jobTitle")?.toString() ?? "",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid input" };
    }
    throw error;
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role,
        jobTitle: data.jobTitle || null,
      },
    });
  } catch {
    return { error: "A user with that email already exists." };
  }

  revalidatePath("/team");
  return { success: true };
}

export async function setUserActive(userId: string, active: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/team");
}
