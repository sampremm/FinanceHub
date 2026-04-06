import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const analystPassword = await bcrypt.hash("Analyst@123", 10);
  const viewerPassword = await bcrypt.hash("Viewer@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@finance.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@finance.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@finance.com" },
    update: {},
    create: {
      name: "Analyst User",
      email: "analyst@finance.com",
      password: analystPassword,
      role: "ANALYST",
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@finance.com" },
    update: {},
    create: {
      name: "Viewer User",
      email: "viewer@finance.com",
      password: viewerPassword,
      role: "VIEWER",
    },
  });

  const categories = ["Salary", "Freelance", "Rent", "Food", "Transport", "Utilities", "Entertainment", "Healthcare"];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const isIncome = Math.random() > 0.4;
    const date = new Date(now.getFullYear(), now.getMonth() - Math.floor(i / 5), 1 + (i % 28));

    await prisma.financialRecord.create({
      data: {
        amount: parseFloat((Math.random() * 9000 + 1000).toFixed(2)),
        type: isIncome ? "INCOME" : "EXPENSE",
        category: isIncome
          ? categories[Math.floor(Math.random() * 2)]
          : categories[Math.floor(Math.random() * 6) + 2],
        date,
        notes: `Auto-generated record ${i + 1}`,
        createdById: i % 3 === 0 ? analyst.id : admin.id,
      },
    });
  }

  console.log("Seeding complete.");
  console.log("---");
  console.log("Admin:   admin@finance.com   / Admin@123");
  console.log("Analyst: analyst@finance.com / Analyst@123");
  console.log("Viewer:  viewer@finance.com  / Viewer@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
