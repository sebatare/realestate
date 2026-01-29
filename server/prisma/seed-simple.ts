import { PrismaClient } from "@prisma/client";

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

  // Crear ubicación de prueba (Los Angeles)
  console.log("📍 Creating test location...");
  const locationResult = await prisma.$queryRaw`
    INSERT INTO "Location" (country, city, state, address, "postalCode", coordinates) 
    VALUES ('United States', 'Los Angeles', 'CA', '123 Main St', '90001', ST_GeomFromText('POINT(-118.2437 34.0522)', 4326))
    RETURNING id
  ` as any[];
  
  const locationId = locationResult[0]?.id || 1;

  // Crear manager
  console.log("👨‍💼 Creating test manager account...");
  const manager = await prisma.manager.create({
    data: {
      cognitoId: "manager-test-001",
      name: "John Manager",
      email: "manager@test.com",
      phoneNumber: "+1-555-0100",
    },
  });

  // Crear tenant
  console.log("👤 Creating test tenant account...");
  const tenant = await prisma.tenant.create({
    data: {
      cognitoId: "tenant-test-001",
      name: "Jane Tenant",
      email: "tenant@test.com",
      phoneNumber: "+1-555-0200",
    },
  });

  // Crear una propiedad de prueba
  console.log("🏠 Creating test property...");
  const property = await prisma.property.create({
    data: {
      name: "Modern Apartment in Downtown LA",
      description: "Beautiful 2-bedroom apartment with city views",
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
      managerCognitoId: manager.cognitoId,
      locationId: locationId,
    },
  });

  console.log("\n✅ Database seed completed successfully!\n");
  console.log("📋 Test Accounts Created:\n");
  console.log("MANAGER:");
  console.log(`  Email: ${manager.email}`);
  console.log(`  Cognito ID: ${manager.cognitoId}`);
  console.log(`  Name: ${manager.name}\n`);
  console.log("TENANT:");
  console.log(`  Email: ${tenant.email}`);
  console.log(`  Cognito ID: ${tenant.cognitoId}`);
  console.log(`  Name: ${tenant.name}\n`);
  console.log("TEST PROPERTY:");
  console.log(`  Name: ${property.name}`);
  console.log(`  Price: $${property.pricePerMonth}/month`);
  console.log(`  Location: Los Angeles, CA\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
