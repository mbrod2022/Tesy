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
      email: "alex.whitfield@riversidecouncil.example",
      phone: "01234 567890",
      jobTitle: "Contracts Officer",
      organisation: "Riverside Borough Council",
      type: "CLIENT",
    },
  });

  const subContact = await prisma.contact.upsert({
    where: { id: "seed-sub-contact" },
    update: {},
    create: {
      id: "seed-sub-contact",
      name: "Priya Shah",
      email: "priya.shah@greenscape.example",
      phone: "01234 000111",
      jobTitle: "Operations Manager",
      organisation: "GreenScape Ltd",
      type: "SUBCONTRACTOR",
    },
  });

  const contract = await prisma.contract.upsert({
    where: { reference: "CON-2026-001" },
    update: {},
    create: {
      reference: "CON-2026-001",
      name: "Grounds Maintenance - North Region",
      clientName: "Riverside Borough Council",
      description:
        "Full grounds maintenance service across the North Region, including seasonal planting and waste removal.",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      value: 480000,
      status: "ACTIVE",
      contractManagerId: manager.id,
      contacts: {
        create: [
          { contactId: clientContact.id, role: "Client lead" },
          { contactId: subContact.id, role: "Subcontractor lead" },
        ],
      },
      externalContracts: {
        create: [
          {
            supplierName: "GreenScape Ltd",
            reference: "SUB-2026-014",
            description: "Grass cutting and hedge maintenance subcontract.",
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-12-31"),
            value: 120000,
            status: "ACTIVE",
          },
        ],
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
      location: "Riverside Council Offices",
      notes: "Review Q3 performance and discuss winter gritting scope.",
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
      title: "Autumn leaf clearance underway",
      content:
        "Leaf clearance across all North Region sites started this week and is on schedule for completion by end of month.",
    },
  });

  await prisma.actionItem.upsert({
    where: { id: "seed-action-1" },
    update: {},
    create: {
      id: "seed-action-1",
      contractId: contract.id,
      description: "Send winter gritting proposal to client",
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
