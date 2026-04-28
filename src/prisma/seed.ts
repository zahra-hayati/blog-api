import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const password = await bcrypt.hash('123456', 10);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password,
      fullName: 'Admin User',
      role: Role.ADMIN,
    },
  });

  // Normal user
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password,
      fullName: 'Normal User',
    },
  });

  // Posts
  const posts = await Promise.all([
    prisma.post.upsert({
      where: { slug: 'nestjs-guide' },
      update: {},
      create: {
        title: 'NestJS Guide',
        slug: 'nestjs-guide',
        content: 'Learn NestJS...',
        published: true,
        authorId: admin.id,
      },
    }),
    prisma.post.upsert({
      where: { slug: 'prisma-tips' },
      update: {},
      create: {
        title: 'Prisma Tips',
        slug: 'prisma-tips',
        content: 'Best practices for Prisma...',
        published: true,
        authorId: user.id,
      },
    }),
  ]);

  // Comments
  await prisma.comment.deleteMany();
  await prisma.comment.createMany({
    data: [
      {
        content: 'Great post!',
        postId: posts[0].id,
        authorId: user.id,
      },
      {
        content: 'Very helpful',
        postId: posts[0].id,
        authorId: admin.id,
      },
      {
        content: 'Nice tips!',
        postId: posts[1].id,
        authorId: admin.id,
      },
    ],
  });

  console.log('Seeded successfully');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
