import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  Card,
  PageHeader,
  PrimaryButton,
  SecondaryLink,
  StatusBadge,
  EmptyState,
} from "@/components/ui";
import { Field, TextInput, TextArea, Select } from "@/components/form";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import {
  addExternalContract,
  deleteExternalContract,
  linkContact,
  unlinkContact,
} from "@/lib/actions/contracts";
import { createMeeting, deleteMeeting } from "@/lib/actions/meetings";
import { createUpdate, deleteUpdate } from "@/lib/actions/updates";
import { createActionItem, deleteActionItem } from "@/lib/actions/action-items";
import { ActionItemStatusSelect } from "@/components/action-item-status";

export default async function ContractDetailPage(
  props: PageProps<"/contracts/[id]">,
) {
  const { id } = await props.params;
  const session = await auth();
  const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";

  const [contract, allContacts, allStaff] = await Promise.all([
    prisma.contract.findUnique({
      where: { id },
      include: {
        contractManager: true,
        externalContracts: { orderBy: { createdAt: "desc" } },
        contacts: { include: { contact: true }, orderBy: { createdAt: "asc" } },
        meetings: {
          orderBy: { meetingDate: "desc" },
          include: { staffAttendees: true, contactAttendees: true, createdBy: true },
        },
        updates: { orderBy: { createdAt: "desc" }, include: { author: true } },
        actionItems: {
          orderBy: { createdAt: "desc" },
          include: { owner: true, meeting: true },
        },
      },
    }),
    prisma.contact.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!contract) notFound();

  const linkedContactIds = new Set(contract.contacts.map((c) => c.contactId));
  const availableContacts = allContacts.filter((c) => !linkedContactIds.has(c.id));

  const boundAddExternalContract = addExternalContract.bind(null, contract.id);
  const boundLinkContact = linkContact.bind(null, contract.id);
  const boundCreateMeeting = createMeeting.bind(null, contract.id);
  const boundCreateUpdate = createUpdate.bind(null, contract.id);
  const boundCreateActionItem = createActionItem.bind(null, contract.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={contract.name}
        description={`${contract.reference} · ${contract.clientName}`}
        action={
          canManage ? (
            <SecondaryLink href={`/contracts/${contract.id}/edit`}>
              Edit contract
            </SecondaryLink>
          ) : undefined
        }
      />

      <Card>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Status</p>
            <div className="mt-1"><StatusBadge status={contract.status} /></div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Value</p>
            <p className="mt-1 text-sm text-slate-900">
              {formatCurrency(contract.value?.toString())}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Dates</p>
            <p className="mt-1 text-sm text-slate-900">
              {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Manager</p>
            <p className="mt-1 text-sm text-slate-900">
              {contract.contractManager?.name ?? "Unassigned"}
            </p>
          </div>
        </div>
        {contract.description && (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
            {contract.description}
          </p>
        )}
      </Card>

      {/* External contracts */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          External / subcontractor contracts
        </h2>
        <div className="space-y-3">
          {contract.externalContracts.length === 0 ? (
            <EmptyState message="No external contracts linked to this contract yet." />
          ) : (
            contract.externalContracts.map((ec) => (
              <Card key={ec.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {ec.supplierName}
                    {ec.reference && (
                      <span className="ml-2 font-mono text-xs text-slate-500">
                        {ec.reference}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(ec.startDate)} – {formatDate(ec.endDate)} ·{" "}
                    {formatCurrency(ec.value?.toString())}
                  </p>
                  {ec.description && (
                    <p className="mt-1 text-sm text-slate-600">{ec.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={ec.status} />
                  {canManage && (
                    <form
                      action={deleteExternalContract.bind(null, contract.id, ec.id)}
                    >
                      <button className="text-xs font-medium text-red-600 hover:underline">
                        Remove
                      </button>
                    </form>
                  )}
                </div>
              </Card>
            ))
          )}

          {canManage && (
            <Card>
              <p className="mb-3 text-sm font-medium text-slate-900">
                Add an external contract
              </p>
              <form action={boundAddExternalContract} className="grid grid-cols-2 gap-3">
                <Field label="Supplier name" htmlFor="supplierName">
                  <TextInput id="supplierName" name="supplierName" required />
                </Field>
                <Field label="Reference" htmlFor="ecReference">
                  <TextInput id="ecReference" name="reference" />
                </Field>
                <Field label="Start date" htmlFor="ecStartDate">
                  <TextInput id="ecStartDate" name="startDate" type="date" required />
                </Field>
                <Field label="End date" htmlFor="ecEndDate">
                  <TextInput id="ecEndDate" name="endDate" type="date" />
                </Field>
                <Field label="Value (£)" htmlFor="ecValue">
                  <TextInput id="ecValue" name="value" type="number" step="0.01" min="0" />
                </Field>
                <Field label="Status" htmlFor="ecStatus">
                  <Select id="ecStatus" name="status" defaultValue="ACTIVE">
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="ON_HOLD">On hold</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="TERMINATED">Terminated</option>
                  </Select>
                </Field>
                <div className="col-span-2">
                  <Field label="Description" htmlFor="ecDescription">
                    <TextArea id="ecDescription" name="description" rows={2} />
                  </Field>
                </div>
                <div className="col-span-2">
                  <PrimaryButton type="submit">Add external contract</PrimaryButton>
                </div>
              </form>
            </Card>
          )}
        </div>
      </section>

      {/* People */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">People</h2>
        <div className="space-y-3">
          {contract.contacts.length === 0 ? (
            <EmptyState message="No contacts linked to this contract yet." />
          ) : (
            <Card>
              <ul className="divide-y divide-slate-100">
                {contract.contacts.map((cc) => (
                  <li key={cc.contactId} className="flex items-center justify-between py-2.5">
                    <div>
                      <Link
                        href={`/contacts/${cc.contact.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {cc.contact.name}
                      </Link>
                      <span className="ml-2 text-xs text-slate-500">
                        {cc.contact.type.replaceAll("_", " ")}
                        {cc.role ? ` · ${cc.role}` : ""}
                      </span>
                    </div>
                    <form action={unlinkContact.bind(null, contract.id, cc.contactId)}>
                      <button className="text-xs font-medium text-red-600 hover:underline">
                        Unlink
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {availableContacts.length > 0 && (
            <Card>
              <p className="mb-3 text-sm font-medium text-slate-900">Link a contact</p>
              <form action={boundLinkContact} className="flex items-end gap-3">
                <div className="flex-1">
                  <Field label="Contact" htmlFor="contactId">
                    <Select id="contactId" name="contactId" required>
                      {availableContacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name} ({contact.type.replaceAll("_", " ")})
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div className="flex-1">
                  <Field label="Role on this contract" htmlFor="role">
                    <TextInput id="role" name="role" placeholder="e.g. Site manager" />
                  </Field>
                </div>
                <PrimaryButton type="submit">Link</PrimaryButton>
              </form>
            </Card>
          )}
        </div>
      </section>

      {/* Meetings */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Meetings</h2>
        <div className="space-y-3">
          {contract.meetings.length === 0 ? (
            <EmptyState message="No meetings logged yet." />
          ) : (
            contract.meetings.map((meeting) => (
              <Card key={meeting.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{meeting.title}</p>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(meeting.meetingDate)}
                      {meeting.location ? ` · ${meeting.location}` : ""}
                    </p>
                  </div>
                  <form action={deleteMeeting.bind(null, contract.id, meeting.id)}>
                    <button className="text-xs font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
                {(meeting.staffAttendees.length > 0 || meeting.contactAttendees.length > 0) && (
                  <p className="mt-2 text-sm text-slate-600">
                    Attendees:{" "}
                    {[
                      ...meeting.staffAttendees.map((a) => a.name),
                      ...meeting.contactAttendees.map((a) => a.name),
                    ].join(", ")}
                  </p>
                )}
                {meeting.notes && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {meeting.notes}
                  </p>
                )}
              </Card>
            ))
          )}

          <Card>
            <p className="mb-3 text-sm font-medium text-slate-900">Log a meeting</p>
            <form action={boundCreateMeeting} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title" htmlFor="meetingTitle">
                  <TextInput id="meetingTitle" name="title" required />
                </Field>
                <Field label="Date & time" htmlFor="meetingDate">
                  <TextInput id="meetingDate" name="meetingDate" type="datetime-local" required />
                </Field>
              </div>
              <Field label="Location" htmlFor="meetingLocation">
                <TextInput id="meetingLocation" name="location" placeholder="e.g. Site office / Teams" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Staff attendees" htmlFor="staffAttendeeIds">
                  <Select id="staffAttendeeIds" name="staffAttendeeIds" multiple size={4}>
                    {allStaff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Other attendees" htmlFor="contactAttendeeIds">
                  <Select id="contactAttendeeIds" name="contactAttendeeIds" multiple size={4}>
                    {allContacts.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Notes" htmlFor="meetingNotes">
                <TextArea id="meetingNotes" name="notes" rows={3} />
              </Field>
              <PrimaryButton type="submit">Save meeting</PrimaryButton>
            </form>
          </Card>
        </div>
      </section>

      {/* Action items */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Action items</h2>
        <div className="space-y-3">
          {contract.actionItems.length === 0 ? (
            <EmptyState message="No action items yet." />
          ) : (
            <Card>
              <ul className="divide-y divide-slate-100">
                {contract.actionItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm text-slate-900">{item.description}</p>
                      <p className="text-xs text-slate-500">
                        {item.owner ? `${item.owner.name} · ` : ""}
                        {item.dueDate ? `Due ${formatDate(item.dueDate)}` : "No due date"}
                        {item.meeting ? ` · From: ${item.meeting.title}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ActionItemStatusSelect
                        contractId={contract.id}
                        itemId={item.id}
                        status={item.status}
                      />
                      <form action={deleteActionItem.bind(null, contract.id, item.id)}>
                        <button className="text-xs font-medium text-red-600 hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <p className="mb-3 text-sm font-medium text-slate-900">Add an action item</p>
            <form action={boundCreateActionItem} className="grid grid-cols-3 gap-3">
              <div className="col-span-3">
                <Field label="Description" htmlFor="actionDescription">
                  <TextInput id="actionDescription" name="description" required />
                </Field>
              </div>
              <Field label="Owner" htmlFor="ownerId">
                <Select id="ownerId" name="ownerId" defaultValue="">
                  <option value="">Unassigned</option>
                  {allStaff.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Due date" htmlFor="dueDate">
                <TextInput id="dueDate" name="dueDate" type="date" />
              </Field>
              <div className="flex items-end">
                <PrimaryButton type="submit">Add</PrimaryButton>
              </div>
            </form>
          </Card>
        </div>
      </section>

      {/* Updates */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Updates</h2>
        <div className="space-y-3">
          <Card>
            <p className="mb-3 text-sm font-medium text-slate-900">Post an update</p>
            <form action={boundCreateUpdate} className="space-y-3">
              <Field label="Title" htmlFor="updateTitle">
                <TextInput id="updateTitle" name="title" required />
              </Field>
              <Field label="Details" htmlFor="updateContent">
                <TextArea id="updateContent" name="content" rows={3} required />
              </Field>
              <PrimaryButton type="submit">Post update</PrimaryButton>
            </form>
          </Card>

          {contract.updates.length === 0 ? (
            <EmptyState message="No updates posted yet." />
          ) : (
            contract.updates.map((update) => (
              <Card key={update.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{update.title}</p>
                    <p className="text-xs text-slate-500">
                      {update.author?.name ?? "Unknown"} · {formatDateTime(update.createdAt)}
                    </p>
                  </div>
                  <form action={deleteUpdate.bind(null, contract.id, update.id)}>
                    <button className="text-xs font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {update.content}
                </p>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
