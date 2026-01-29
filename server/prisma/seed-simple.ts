import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Limpiar datos existentes
  console.log("🗑️  Clearing existing data...");
  await prisma.payment.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.lease.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.manager.deleteMany({});

  // Crear ubicaciones de prueba
  console.log("📍 Creating test locations...");
  const locationsData = [
    {
      country: "United States",
      city: "Los Angeles",
      state: "CA",
      address: "123 Main St",
      postalCode: "90001",
      coords: "POINT(-118.2437 34.0522)",
    },
    {
      country: "United States",
      city: "Santa Monica",
      state: "CA",
      address: "456 Ocean Ave",
      postalCode: "90401",
      coords: "POINT(-118.4912 34.0195)",
    },
    {
      country: "United States",
      city: "Beverly Hills",
      state: "CA",
      address: "789 Sunset Blvd",
      postalCode: "90210",
      coords: "POINT(-118.4065 34.0901)",
    },
  ];

  const locations = await Promise.all(
    locationsData.map(async (loc) => {
      const result = await prisma.$queryRaw`
        INSERT INTO "Location" (country, city, state, address, "postalCode", coordinates) 
        VALUES (${loc.country}, ${loc.city}, ${loc.state}, ${loc.address}, ${loc.postalCode}, ST_GeomFromText(${loc.coords}, 4326))
        RETURNING id
      ` as any[];
      return result[0]?.id;
    })
  );

  console.log(`✓ Created ${locations.length} locations`);

  // Hash passwords for test accounts
  const password1 = await bcrypt.hash("password123", 10);
  const password2 = await bcrypt.hash("password456", 10);
  const password3 = await bcrypt.hash("password789", 10);
  const password4 = await bcrypt.hash("password101112", 10);
  const password5 = await bcrypt.hash("password131415", 10);

  // Crear managers
  console.log("\n👨‍💼 Creating test manager accounts...");
  const managers = await Promise.all([
    prisma.manager.create({
      data: {
        cognitoId: "manager-test-001",
        name: "John Manager",
        email: "manager@test.com",
        phoneNumber: "+1-555-0100",
        password: password1,
      },
    }),
    prisma.manager.create({
      data: {
        cognitoId: "manager-test-002",
        name: "Sarah Properties",
        email: "sarah@test.com",
        phoneNumber: "+1-555-0101",
        password: password2,
      },
    }),
  ]);

  console.log(`✓ Created ${managers.length} managers`);

  // Crear tenants
  console.log("\n👤 Creating test tenant accounts...");
  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        cognitoId: "tenant-test-001",
        name: "Jane Tenant",
        email: "tenant@test.com",
        phoneNumber: "+1-555-0200",
        password: password3,
      },
    }),
    prisma.tenant.create({
      data: {
        cognitoId: "tenant-test-002",
        name: "Mike Renter",
        email: "mike@test.com",
        phoneNumber: "+1-555-0201",
        password: password4,
      },
    }),
    prisma.tenant.create({
      data: {
        cognitoId: "tenant-test-003",
        name: "Lisa Apartment",
        email: "lisa@test.com",
        phoneNumber: "+1-555-0202",
        password: password5,
      },
    }),
  ]);

  console.log(`✓ Created ${tenants.length} tenants`);

  // Crear propiedades
  console.log("\n🏠 Creating test properties...");
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        name: "Modern Downtown Apartment",
        description:
          "Beautiful 2-bedroom apartment with city views, gym, and parking",
        pricePerMonth: 2500,
        securityDeposit: 5000,
        applicationFee: 75,
        beds: 2,
        baths: 2,
        squareFeet: 1200,
        propertyType: "Apartment",
        amenities: ["WiFi", "Parking", "Gym"],
        highlights: ["RecentlyRenovated", "GreatView"],
        photoUrls: [],
        managerCognitoId: managers[0].cognitoId,
        locationId: locations[0],
      },
    }),
    prisma.property.create({
      data: {
        name: "Beachfront Villa",
        description:
          "Luxury 3-bedroom villa with ocean views and private beach access",
        pricePerMonth: 4500,
        securityDeposit: 9000,
        applicationFee: 100,
        beds: 3,
        baths: 3,
        squareFeet: 2500,
        propertyType: "Villa",
        amenities: ["WiFi", "Parking", "Pool"],
        highlights: ["GreatView", "HighSpeedInternetAccess"],
        photoUrls: [],
        managerCognitoId: managers[1].cognitoId,
        locationId: locations[1],
      },
    }),
    prisma.property.create({
      data: {
        name: "Cozy Studio in Beverly Hills",
        description: "Charming studio apartment, perfect for professionals",
        pricePerMonth: 1800,
        securityDeposit: 3600,
        applicationFee: 50,
        beds: 1,
        baths: 1,
        squareFeet: 600,
        propertyType: "Apartment",
        amenities: ["WiFi", "Dishwasher"],
        highlights: ["CloseToTransit"],
        photoUrls: [],
        managerCognitoId: managers[1].cognitoId,
        locationId: locations[2],
      },
    }),
    prisma.property.create({
      data: {
        name: "Spacious Townhouse",
        description:
          "4-bedroom townhouse with backyard and modern amenities",
        pricePerMonth: 3200,
        securityDeposit: 6400,
        applicationFee: 75,
        beds: 4,
        baths: 2.5,
        squareFeet: 1800,
        propertyType: "Townhouse",
        amenities: ["Parking", "Gym", "WiFi"],
        highlights: ["RecentlyRenovated"],
        photoUrls: [],
        managerCognitoId: managers[0].cognitoId,
        locationId: locations[0],
      },
    }),
  ]);

  console.log(`✓ Created ${properties.length} properties`);

  // Crear leases
  console.log("\n📅 Creating test leases...");
  const startDate = new Date("2024-01-15");
  const endDate = new Date("2025-01-15");

  const leases = await Promise.all([
    prisma.lease.create({
      data: {
        startDate,
        endDate,
        rent: 2500,
        deposit: 5000,
        propertyId: properties[0].id,
        tenantCognitoId: tenants[0].cognitoId,
      },
    }),
    prisma.lease.create({
      data: {
        startDate: new Date("2023-06-01"),
        endDate: new Date("2026-06-01"),
        rent: 4500,
        deposit: 9000,
        propertyId: properties[1].id,
        tenantCognitoId: tenants[1].cognitoId,
      },
    }),
    prisma.lease.create({
      data: {
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-09-01"),
        rent: 1800,
        deposit: 3600,
        propertyId: properties[2].id,
        tenantCognitoId: tenants[2].cognitoId,
      },
    }),
  ]);

  console.log(`✓ Created ${leases.length} leases`);

  // Crear applications
  console.log("\n📋 Creating test applications...");
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        applicationDate: new Date(),
        status: "Approved",
        propertyId: properties[0].id,
        tenantCognitoId: tenants[0].cognitoId,
        name: tenants[0].name,
        email: tenants[0].email,
        phoneNumber: tenants[0].phoneNumber,
        message: "Very interested in this property!",
        leaseId: leases[0].id,
      },
    }),
    prisma.application.create({
      data: {
        applicationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        status: "Approved",
        propertyId: properties[1].id,
        tenantCognitoId: tenants[1].cognitoId,
        name: tenants[1].name,
        email: tenants[1].email,
        phoneNumber: tenants[1].phoneNumber,
        message: "Looking forward to moving in",
        leaseId: leases[1].id,
      },
    }),
    prisma.application.create({
      data: {
        applicationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        status: "Pending",
        propertyId: properties[3].id,
        tenantCognitoId: tenants[0].cognitoId,
        name: tenants[0].name,
        email: tenants[0].email,
        phoneNumber: tenants[0].phoneNumber,
        message: "Interested in this townhouse",
      },
    }),
  ]);

  console.log(`✓ Created ${applications.length} applications`);

  // Crear payments
  console.log("\n💳 Creating test payments...");
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        amountDue: 2500,
        amountPaid: 2500,
        dueDate: new Date("2025-01-15"),
        paymentDate: new Date("2025-01-10"),
        paymentStatus: "Paid",
        leaseId: leases[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amountDue: 2500,
        amountPaid: 2500,
        dueDate: new Date("2025-02-15"),
        paymentDate: new Date(),
        paymentStatus: "Paid",
        leaseId: leases[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amountDue: 4500,
        amountPaid: 4500,
        dueDate: new Date("2025-02-15"),
        paymentDate: new Date("2025-02-10"),
        paymentStatus: "Paid",
        leaseId: leases[1].id,
      },
    }),
    prisma.payment.create({
      data: {
        amountDue: 1800,
        amountPaid: 0,
        dueDate: new Date("2024-06-01"),
        paymentDate: new Date(),
        paymentStatus: "Overdue",
        leaseId: leases[2].id,
      },
    }),
  ]);

  console.log(`✓ Created ${payments.length} payments`);

  // Agregar favorites
  console.log("\n❤️ Adding favorites...");
  await prisma.tenant.update({
    where: { cognitoId: tenants[0].cognitoId },
    data: {
      favorites: {
        connect: [{ id: properties[1].id }, { id: properties[2].id }],
      },
    },
  });

  console.log(`✓ Added favorites for tenant 1`);

  console.log("\n✅ Database seed completed successfully!\n");
  console.log("📋 Test Accounts:\n");
  console.log("MANAGERS:");
  console.log("  1. John Manager (manager@test.com) / password123");
  console.log("  2. Sarah Properties (sarah@test.com) / password456");
  console.log("\nTENANTS:");
  console.log("  1. Jane Tenant (tenant@test.com) / password789");
  console.log("  2. Mike Renter (mike@test.com) / password101112");
  console.log("  3. Lisa Apartment (lisa@test.com) / password131415");

  console.log("\n📊 DATA SUMMARY:");
  console.log(`  Locations: ${locations.length}`);
  console.log(`  Properties: ${properties.length}`);
  console.log(`  Leases: ${leases.length}`);
  console.log(`  Applications: ${applications.length}`);
  console.log(`  Payments: ${payments.length}`);
  console.log(`  Favorites: 2\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
