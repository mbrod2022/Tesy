import { PrismaClient } from "@prisma/client";
import { CURRICULUM } from "../src/lib/curriculum";

const prisma = new PrismaClient();

async function main() {
  for (const topic of CURRICULUM) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        track: topic.track,
        title: topic.title,
        summary: topic.summary,
        order: topic.order,
      },
      create: {
        slug: topic.slug,
        track: topic.track,
        title: topic.title,
        summary: topic.summary,
        order: topic.order,
      },
    });
  }

  console.log(`Seeded ${CURRICULUM.length} curriculum topics.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
