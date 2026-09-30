/**
 * Adds a larger set of realistic pretend data on top of prisma/seed.ts,
 * modelled on waste-management IT service delivery: contracts are council
 * areas / business functions (Collections, HWRC, Depot/Office, Other),
 * with contacts, meetings, updates, action items and holidays.
 *
 * Safe to re-run - everything is upserted by a stable id/reference.
 * Usage: npm run db:demo
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(opts: {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
  jobTitle: string;
}) {
  return prisma.user.upsert({
    where: { email: opts.email },
    update: {},
    create: {
      id: opts.id,
      name: opts.name,
      email: opts.email,
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      role: opts.role,
      jobTitle: opts.jobTitle,
      mustChangePassword: true,
    },
  });
}

async function main() {
  // --- Team ---
  const serviceDeliveryManager = await upsertUser({
    id: "demo-user-sdm",
    name: "Priya Anand",
    email: "priya.anand@fccenvironment.co.uk",
    role: "MANAGER",
    jobTitle: "IT Service Delivery Manager",
  });
  const systemsAnalyst = await upsertUser({
    id: "demo-user-sysanalyst",
    name: "Tom Whitfield",
    email: "tom.whitfield@fccenvironment.co.uk",
    role: "STAFF",
    jobTitle: "Systems Analyst",
  });
  const supportEngineer = await upsertUser({
    id: "demo-user-support",
    name: "Leah Osei",
    email: "leah.osei@fccenvironment.co.uk",
    role: "STAFF",
    jobTitle: "IT Support Engineer",
  });
  const projectManager = await upsertUser({
    id: "demo-user-pm",
    name: "Callum Reid",
    email: "callum.reid@fccenvironment.co.uk",
    role: "MANAGER",
    jobTitle: "IT Projects Manager",
  });

  // --- Contracts: council areas / business functions ---
  const contractDefs = [
    {
      id: "demo-contract-bucks-collections",
      reference: "BUCKS-COLL",
      name: "Bucks Household Collections",
      clientName: "Buckinghamshire Council",
      type: "COLLECTIONS" as const,
      description:
        "Kerbside waste and recycling collections IT systems: in-cab devices, round optimisation, and customer contact integration.",
      startDate: new Date("2024-04-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE" as const,
      managerId: serviceDeliveryManager.id,
    },
    {
      id: "demo-contract-bucks-hwrc",
      reference: "BUCKS-HWRC",
      name: "Bucks HWRC",
      clientName: "Buckinghamshire Council",
      type: "HWRC" as const,
      description:
        "Household Waste Recycling Centre sites across Buckinghamshire: site access control, weighbridge software, and reporting.",
      startDate: new Date("2024-04-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE" as const,
      managerId: serviceDeliveryManager.id,
    },
    {
      id: "demo-contract-suffolk-collections",
      reference: "SUFFOLK-COLL",
      name: "Suffolk Waste Collections",
      clientName: "Suffolk County Council",
      type: "COLLECTIONS" as const,
      description:
        "Collections rounds IT platform and driver handheld devices for the Suffolk contract area.",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2026-08-31"),
      status: "ACTIVE" as const,
      managerId: projectManager.id,
    },
    {
      id: "demo-contract-hillingdon-hwrc",
      reference: "HILL-HWRC",
      name: "Hillingdon HWRC",
      clientName: "London Borough of Hillingdon",
      type: "HWRC" as const,
      description:
        "HWRC site systems and permit/booking platform for Hillingdon residents.",
      startDate: new Date("2025-01-01"),
      endDate: null,
      status: "ACTIVE" as const,
      managerId: serviceDeliveryManager.id,
    },
    {
      id: "demo-contract-fleet",
      reference: "GRP-FLEET",
      name: "Group Fleet Management System",
      clientName: "FCC Environment (internal)",
      type: "OTHER" as const,
      description:
        "Cross-contract fleet telematics and vehicle maintenance scheduling platform used by all collection contracts.",
      startDate: new Date("2022-06-01"),
      endDate: null,
      status: "ACTIVE" as const,
      managerId: projectManager.id,
    },
  ];

  for (const def of contractDefs) {
    const fields = {
      reference: def.reference,
      name: def.name,
      clientName: def.clientName,
      type: def.type,
      description: def.description,
      startDate: def.startDate,
      endDate: def.endDate,
      status: def.status,
      contractManagerId: def.managerId,
    };
    await prisma.contract.upsert({
      where: { reference: def.reference },
      update: fields,
      create: { id: def.id, ...fields },
    });
  }

  // --- Contacts: council officers + vendor contacts ---
  const contactDefs = [
    {
      id: "demo-contact-bucks-officer",
      name: "Rebecca Marsh",
      email: "rebecca.marsh@buckinghamshire.gov.uk",
      phone: "01296 000111",
      jobTitle: "Waste Contracts Officer",
      organisation: "Buckinghamshire Council",
      type: "CLIENT" as const,
    },
    {
      id: "demo-contact-suffolk-officer",
      name: "David Nkomo",
      email: "d.nkomo@suffolk.gov.uk",
      phone: "01473 000222",
      jobTitle: "Environmental Services Manager",
      organisation: "Suffolk County Council",
      type: "CLIENT" as const,
    },
    {
      id: "demo-contact-hillingdon-officer",
      name: "Sarah Byrne",
      email: "sarah.byrne@hillingdon.gov.uk",
      phone: "01895 000333",
      jobTitle: "Recycling Services Officer",
      organisation: "London Borough of Hillingdon",
      type: "CLIENT" as const,
    },
    {
      id: "demo-contact-bartec-vendor",
      name: "Ian Foster",
      email: "ian.foster@bartec-municipal.example",
      phone: "0161 000444",
      jobTitle: "Account Manager",
      organisation: "Bartec Municipal",
      type: "SUBCONTRACTOR" as const,
    },
  ];

  for (const def of contactDefs) {
    await prisma.contact.upsert({
      where: { id: def.id },
      update: {},
      create: def,
    });
  }

  await prisma.contractContact.upsert({
    where: {
      contractId_contactId: {
        contractId: "demo-contract-bucks-collections",
        contactId: "demo-contact-bucks-officer",
      },
    },
    update: {},
    create: {
      contractId: "demo-contract-bucks-collections",
      contactId: "demo-contact-bucks-officer",
      role: "Client lead",
    },
  });
  await prisma.contractContact.upsert({
    where: {
      contractId_contactId: {
        contractId: "demo-contract-bucks-hwrc",
        contactId: "demo-contact-bucks-officer",
      },
    },
    update: {},
    create: {
      contractId: "demo-contract-bucks-hwrc",
      contactId: "demo-contact-bucks-officer",
      role: "Client lead",
    },
  });
  await prisma.contractContact.upsert({
    where: {
      contractId_contactId: {
        contractId: "demo-contract-suffolk-collections",
        contactId: "demo-contact-suffolk-officer",
      },
    },
    update: {},
    create: {
      contractId: "demo-contract-suffolk-collections",
      contactId: "demo-contact-suffolk-officer",
      role: "Client lead",
    },
  });
  await prisma.contractContact.upsert({
    where: {
      contractId_contactId: {
        contractId: "demo-contract-hillingdon-hwrc",
        contactId: "demo-contact-hillingdon-officer",
      },
    },
    update: {},
    create: {
      contractId: "demo-contract-hillingdon-hwrc",
      contactId: "demo-contact-hillingdon-officer",
      role: "Client lead",
    },
  });
  await prisma.contractContact.upsert({
    where: {
      contractId_contactId: {
        contractId: "demo-contract-bucks-collections",
        contactId: "demo-contact-bartec-vendor",
      },
    },
    update: {},
    create: {
      contractId: "demo-contract-bucks-collections",
      contactId: "demo-contact-bartec-vendor",
      role: "Vendor contact",
    },
  });

  // --- Meetings ---
  const now = new Date();
  const inDays = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  await prisma.meeting.upsert({
    where: { id: "demo-meeting-bucks-review" },
    update: {},
    create: {
      id: "demo-meeting-bucks-review",
      contractId: "demo-contract-bucks-collections",
      title: "Monthly service review",
      meetingDate: inDays(-3),
      location: "Teams",
      notes: "Reviewed round optimisation performance and missed-bin reports for August.",
      createdById: serviceDeliveryManager.id,
      staffAttendees: { connect: [{ id: serviceDeliveryManager.id }, { id: supportEngineer.id }] },
      contactAttendees: { connect: [{ id: "demo-contact-bucks-officer" }] },
    },
  });

  await prisma.meeting.upsert({
    where: { id: "demo-meeting-hwrc-onboarding" },
    update: {},
    create: {
      id: "demo-meeting-hwrc-onboarding",
      contractId: "demo-contract-hillingdon-hwrc",
      title: "Booking platform go-live readiness",
      meetingDate: inDays(4),
      location: "Hillingdon Civic Centre",
      notes: "Walkthrough of go-live plan and support handover for the new booking platform.",
      createdById: projectManager.id,
      staffAttendees: { connect: [{ id: projectManager.id }, { id: systemsAnalyst.id }] },
      contactAttendees: { connect: [{ id: "demo-contact-hillingdon-officer" }] },
    },
  });

  await prisma.meeting.upsert({
    where: { id: "demo-meeting-suffolk-telematics" },
    update: {},
    create: {
      id: "demo-meeting-suffolk-telematics",
      contractId: "demo-contract-suffolk-collections",
      title: "Telematics upgrade planning",
      meetingDate: inDays(10),
      location: "Ipswich Depot",
      notes: "Plan the rollout of the Yotta Alloy firmware upgrade across the fleet.",
      createdById: projectManager.id,
      staffAttendees: { connect: [{ id: projectManager.id }] },
      contactAttendees: { connect: [{ id: "demo-contact-suffolk-officer" }] },
    },
  });

  // --- Updates ---
  const updateDefs = [
    {
      id: "demo-update-bucks-1",
      contractId: "demo-contract-bucks-collections",
      authorId: supportEngineer.id,
      title: "In-cab devices firmware rollout complete",
      content: "All 42 collection vehicles updated to the latest Bartec firmware overnight with no reported issues.",
    },
    {
      id: "demo-update-hwrc-1",
      contractId: "demo-contract-bucks-hwrc",
      authorId: systemsAnalyst.id,
      title: "Weighbridge outage resolved",
      content: "Restored weighbridge connectivity at the Aylesbury HWRC site after a network switch failure; site was on manual recording for 3 hours.",
    },
    {
      id: "demo-update-hillingdon-1",
      contractId: "demo-contract-hillingdon-hwrc",
      authorId: projectManager.id,
      title: "Booking platform UAT started",
      content: "User acceptance testing for the new SiteAssist booking platform started with the council's customer services team.",
    },
  ];
  for (const def of updateDefs) {
    await prisma.update.upsert({ where: { id: def.id }, update: {}, create: def });
  }

  // --- Action items ---
  const actionItemDefs = [
    {
      id: "demo-action-1",
      contractId: "demo-contract-bucks-collections",
      description: "Confirm winter gritting round changes with council before December",
      dueDate: inDays(20),
      ownerId: serviceDeliveryManager.id,
      status: "OPEN" as const,
    },
    {
      id: "demo-action-2",
      contractId: "demo-contract-bucks-hwrc",
      description: "Replace ageing network switch at Aylesbury HWRC",
      dueDate: inDays(7),
      ownerId: systemsAnalyst.id,
      status: "IN_PROGRESS" as const,
    },
    {
      id: "demo-action-3",
      contractId: "demo-contract-hillingdon-hwrc",
      description: "Sign off UAT results for booking platform go-live",
      dueDate: inDays(12),
      ownerId: projectManager.id,
      status: "OPEN" as const,
    },
    {
      id: "demo-action-4",
      contractId: "demo-contract-suffolk-collections",
      description: "Schedule telematics firmware upgrade maintenance window",
      dueDate: inDays(15),
      ownerId: projectManager.id,
      status: "OPEN" as const,
    },
  ];
  for (const def of actionItemDefs) {
    await prisma.actionItem.upsert({ where: { id: def.id }, update: {}, create: def });
  }

  // --- Holidays ---
  const holidayDefs = [
    {
      id: "demo-holiday-1",
      userId: supportEngineer.id,
      startDate: inDays(2),
      endDate: inDays(6),
      type: "ANNUAL_LEAVE" as const,
      status: "APPROVED" as const,
    },
    {
      id: "demo-holiday-2",
      userId: systemsAnalyst.id,
      startDate: inDays(25),
      endDate: inDays(30),
      type: "ANNUAL_LEAVE" as const,
      status: "REQUESTED" as const,
    },
  ];
  for (const def of holidayDefs) {
    await prisma.holiday.upsert({ where: { id: def.id }, update: {}, create: def });
  }

  console.log("Demo data loaded.");
  console.log("New accounts (all password ChangeMe123!, forced to change on first login):");
  for (const u of [serviceDeliveryManager, systemsAnalyst, supportEngineer, projectManager]) {
    console.log(`  ${u.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
