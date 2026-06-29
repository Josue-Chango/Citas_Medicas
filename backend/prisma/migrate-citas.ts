import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as fs from "fs";
import * as path from "path";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function migrar() {
  const filePath = path.join(__dirname, "../data/citas.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const citas = JSON.parse(raw);

  let count = 0;
  for (const cita of citas) {
    const paciente = await prisma.user.findUnique({ where: { id: cita.pacienteId } });
    if (!paciente) {
      console.log(`Saltando cita ${cita.id}: paciente ${cita.pacienteId} no existe en BD`);
      continue;
    }
    const doctor = await prisma.doctor.findUnique({ where: { id: cita.medicoId } });
    if (!doctor) {
      console.log(`Saltando cita ${cita.id}: médico ${cita.medicoId} no existe en BD`);
      continue;
    }

    await prisma.appointment.upsert({
      where: { id: cita.id },
      update: {},
      create: {
        id: cita.id,
        pacienteId: cita.pacienteId,
        medicoId: cita.medicoId,
        especialidad: cita.especialidad,
        fecha: cita.fecha,
        hora: cita.hora,
        estado: cita.estado,
        descuentoAplicado: cita.descuentoAplicado,
        createdAt: new Date(cita.createdAt),
      },
    });
    count++;
  }

  console.log(`Migración completada: ${count} citas importadas`);
  await prisma.$disconnect();
}

migrar().catch((e) => { console.error(e); process.exit(1); });
