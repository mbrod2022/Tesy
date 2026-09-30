import { PageHeader, Card } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { createContact } from "@/lib/actions/contacts";

export default function NewContactPage() {
  return (
    <div>
      <PageHeader title="New contact" />
      <Card className="max-w-2xl">
        <ContactForm action={createContact} submitLabel="Create contact" />
      </Card>
    </div>
  );
}
