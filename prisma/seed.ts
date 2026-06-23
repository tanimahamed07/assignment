import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapterFactory = new PrismaLibSql({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter: adapterFactory as any });

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.preorder.deleteMany();

  // Sample preorder data with mix of active/inactive and various dates
  const preorders = [
    {
      name: "iPhone 16 Pro Max",
      products: 150,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-01-15T09:00:00Z"),
      endsAt: new Date("2026-12-31T23:59:59Z"),
      status: true,
    },
    {
      name: "Samsung Galaxy S25 Ultra",
      products: 200,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-02-01T08:00:00Z"),
      endsAt: new Date("2026-11-30T23:59:59Z"),
      status: true,
    },
    {
      name: "PlayStation 6",
      products: 500,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-03-10T00:00:00Z"),
      endsAt: null,
      status: true,
    },
    {
      name: "MacBook Pro M4",
      products: 100,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2025-11-01T10:00:00Z"),
      endsAt: new Date("2026-01-15T23:59:59Z"),
      status: false,
    },
    {
      name: "Tesla Model 3 2027",
      products: 50,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-04-20T12:00:00Z"),
      endsAt: new Date("2027-12-31T23:59:59Z"),
      status: true,
    },
    {
      name: "Nintendo Switch 2",
      products: 300,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-05-15T06:00:00Z"),
      endsAt: null,
      status: true,
    },
    {
      name: "Apple Vision Pro 2",
      products: 75,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2025-12-01T09:00:00Z"),
      endsAt: new Date("2026-03-01T23:59:59Z"),
      status: false,
    },
    {
      name: "Google Pixel 10",
      products: 180,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-06-01T07:00:00Z"),
      endsAt: new Date("2026-12-31T23:59:59Z"),
      status: true,
    },
    {
      name: "AirPods Pro 4",
      products: 250,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-02-20T10:00:00Z"),
      endsAt: new Date("2026-08-20T23:59:59Z"),
      status: true,
    },
    {
      name: "Xbox Series Z",
      products: 400,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2025-10-15T08:00:00Z"),
      endsAt: new Date("2025-12-31T23:59:59Z"),
      status: false,
    },
    {
      name: "DJI Mavic 5 Pro",
      products: 120,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-07-01T09:00:00Z"),
      endsAt: null,
      status: true,
    },
    {
      name: "GoPro Hero 13",
      products: 200,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-03-15T10:00:00Z"),
      endsAt: new Date("2026-09-15T23:59:59Z"),
      status: true,
    },
    {
      name: "Sony WH-1000XM6",
      products: 150,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2025-09-01T08:00:00Z"),
      endsAt: new Date("2025-11-30T23:59:59Z"),
      status: false,
    },
    {
      name: "iPad Pro M4 13-inch",
      products: 175,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-04-10T09:00:00Z"),
      endsAt: new Date("2026-10-31T23:59:59Z"),
      status: true,
    },
    {
      name: "Meta Quest 4",
      products: 220,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-08-01T10:00:00Z"),
      endsAt: null,
      status: true,
    },
    {
      name: "Surface Laptop 6",
      products: 90,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2025-08-15T09:00:00Z"),
      endsAt: new Date("2025-10-31T23:59:59Z"),
      status: false,
    },
    {
      name: "Steam Deck 2",
      products: 350,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-09-01T12:00:00Z"),
      endsAt: new Date("2027-03-31T23:59:59Z"),
      status: true,
    },
    {
      name: "Razer Blade 18 2027",
      products: 80,
      preorderWhen: "regardless_of_stock" as const,
      startsAt: new Date("2026-05-20T08:00:00Z"),
      endsAt: new Date("2026-12-31T23:59:59Z"),
      status: true,
    },
  ];

  // Insert preorders
  for (const preorder of preorders) {
    await prisma.preorder.create({
      data: preorder,
    });
  }

  console.log(`✅ Successfully seeded ${preorders.length} preorders!`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error seeding database:", e);
  process.exit(1);
});
