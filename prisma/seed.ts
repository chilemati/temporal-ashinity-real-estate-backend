import prisma from "../src/prismaClient";
import bcrypt from "bcryptjs";
// npx prisma db seed

async function main() {
  const email = "amadichile007+test2@gmail.com";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("User exists. Updating role to superadmin...");

    await prisma.user.update({
      where: { email },
      data: {
        role: "superadmin",
      },
    });

    console.log("User role updated successfully");
    return;
  }

  const password = await bcrypt.hash("SuperAdminPass123!", 10);

  await prisma.user.create({
    data: {
      email,
      password,
      role: "superadmin",
      firstName: "System",
      lastName: "Root",
    },
  });

  console.log("Superadmin created successfully");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
