import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({ connectionString });
  }
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(globalForPrisma.pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
