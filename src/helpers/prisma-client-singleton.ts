import { PrismaClient } from "@prisma/client";

const prisma = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prisma>;
}

const SingletonPrismaClient = globalThis.prismaGlobal ?? prisma();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = SingletonPrismaClient;
}

export const prismaClientSingleton = SingletonPrismaClient;
