"use server";

import { prismaClientSingleton } from "@/helpers/prisma-client-singleton";
import { ENTITY } from "@prisma/client";

export async function saveMassUploadRequestAction(
  name: string,
  json: any,
  parent_id: number,
) {
  return prismaClientSingleton.massUpload.create({
    data: { name, json, target: ENTITY.CATEGORY, parent_id },
  });
}

export async function findMassUploadRequestWithNameAction(name: string) {
  return prismaClientSingleton.massUpload.findFirst({
    where: { name },
  });
}

export async function findMassUploadRequestWithIdAction(id: number) {
  return prismaClientSingleton.massUpload.findUnique({
    where: { id },
  });
}

export async function deleteMassUploadRequestWithIdAction(id: number) {
  return prismaClientSingleton.massUpload.delete({
    where: {
      id,
    },
  });
}
