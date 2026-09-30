import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "michael.broderick@fccenvironment.co.uk" },
    update: {},
    create: {
      name: "Michael Broderick",
      email: "michael.broderick@fccenvironment.co.uk",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      jobTitle: "Service Delivery Lead",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: {
      name: "Jordan Reid",
      email: "manager@example.com",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      role: "MANAGER",
      jobTitle: "Contracts Manager",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {},
    create: {
      name: "Sam Patel",
      email: "staff@example.com",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      role: "STAFF",
      jobTitle: "Field Supervisor",
    },
  });

  const clientContact = await prisma.contact.upsert({
    where: { id: "seed-client-contact" },
    update: {},
    create: {
      id: "seed-client-contact",
      name: "Alex Whitfield",
      email: "alex.whitfield@buckinghamshire.gov.uk",
      phone: "01234 567890",
      jobTitle: "Waste Contracts Officer",
      organisation: "Buckinghamshire Council",
      type: "CLIENT",
    },
  });

  const contract = await prisma.contract.upsert({
    where: { reference: "BUCKS-HWRC" },
    update: {},
    create: {
      reference: "BUCKS-HWRC",
      name: "Bucks HWRC",
      clientName: "Buckinghamshire Council",
      type: "HWRC",
      description:
        "Household Waste Recycling Centre sites across Buckinghamshire: site access control, weighbridge software, and reporting.",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      status: "ACTIVE",
      contractManagerId: manager.id,
      contacts: {
        create: [{ contactId: clientContact.id, role: "Client lead" }],
      },
    },
  });

  await prisma.meeting.upsert({
    where: { id: "seed-meeting-1" },
    update: {},
    create: {
      id: "seed-meeting-1",
      contractId: contract.id,
      title: "Quarterly contract review",
      meetingDate: new Date("2026-09-15T10:00:00Z"),
      location: "Buckinghamshire Council Offices",
      notes: "Review Q3 site performance and discuss winter opening hours.",
      createdById: manager.id,
      staffAttendees: { connect: [{ id: manager.id }, { id: staff.id }] },
      contactAttendees: { connect: [{ id: clientContact.id }] },
    },
  });

  await prisma.update.upsert({
    where: { id: "seed-update-1" },
    update: {},
    create: {
      id: "seed-update-1",
      contractId: contract.id,
      authorId: staff.id,
      title: "Weighbridge software upgrade complete",
      content:
        "All Buckinghamshire HWRC sites are now running the latest weighbridge software with no reported issues.",
    },
  });

  await prisma.actionItem.upsert({
    where: { id: "seed-action-1" },
    update: {},
    create: {
      id: "seed-action-1",
      contractId: contract.id,
      description: "Send winter opening hours proposal to council",
      dueDate: new Date("2026-10-01"),
      ownerId: manager.id,
      status: "OPEN",
    },
  });

  await prisma.holiday.upsert({
    where: { id: "seed-holiday-1" },
    update: {},
    create: {
      id: "seed-holiday-1",
      userId: staff.id,
      startDate: new Date("2026-09-10"),
      endDate: new Date("2026-09-14"),
      type: "ANNUAL_LEAVE",
      status: "APPROVED",
    },
  });

  console.log("Seed complete.");
  console.log(`Admin login: ${admin.email} / ChangeMe123!`);
  console.log("Manager login: manager@example.com / ChangeMe123!");
  console.log("Staff login: staff@example.com / ChangeMe123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
