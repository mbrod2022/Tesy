import { auth } from "@/auth";

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to do this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  return session.user;
}

export async function requireManager() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new ForbiddenError();
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new ForbiddenError();
  }
  return user;
}
