import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingComments() {
  const comments = await prisma.cMSEntryComment.findMany({
    include: {
      postedByUser: { select: { username: true } },
    },
  });

  for (const comment of comments) {
    await prisma.cMSEntryComment.update({
      where: { id: comment.id },
      data: { postedByUsername: comment.postedByUser?.username || "Unknown" },
    });
  }

  console.log("Updated all comments with username.");
}

updateExistingComments().catch(console.error).finally(() => prisma.$disconnect());
