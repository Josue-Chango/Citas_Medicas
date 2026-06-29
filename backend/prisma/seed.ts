import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.createMany({
    data: [
      { id: '1', nombre: 'Juan Pérez', email: 'juan@email.com', password: '123456', tieneSeguro: true, penalizado: false },
      { id: '2', nombre: 'María López', email: 'maria@email.com', password: '123456', tieneSeguro: false, penalizado: false },
      { id: '3', nombre: 'Carlos Ruiz', email: 'carlos@email.com', password: '123456', tieneSeguro: true, penalizado: true },
    ],
    skipDuplicates: true,
  });

  await prisma.doctor.createMany({
    data: [
      { id: '1', nombre: 'Dr. Ana García', especialidad: 'Cardiología' },
      { id: '2', nombre: 'Dr. Luis Martínez', especialidad: 'Cardiología' },
      { id: '3', nombre: 'Dr. Sofía Ramírez', especialidad: 'Dermatología' },
      { id: '4', nombre: 'Dr. Pedro Sánchez', especialidad: 'Dermatología' },
      { id: '5', nombre: 'Dr. Laura Torres', especialidad: 'Pediatría' },
      { id: '6', nombre: 'Dr. Andrés Vega', especialidad: 'Pediatría' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
