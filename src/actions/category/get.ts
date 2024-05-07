"use server";

import { prismaClientSingleton } from "@/helpers/prisma-client-singleton";
import {
  ICategory,
  IGetCategoriesParams,
} from "@/interfaces/category/category";

export async function getCategoriesAction(
  body: IGetCategoriesParams,
): Promise<ICategory[]> {
  return prismaClientSingleton.category.findMany({
    orderBy: {
      order: "asc",
    },
    where: { ...(body.level !== 0 ? { level: body.level } : {}) },
    select: {
      id: true,
      order: true,
      level: true,
      parent_id: true,
      created_at: true,
      updated_at: true,
      ...(body.with_child ? { children: true } : {}),
      name: {
        select: {
          name_en: true,
          name_vi: true,
        },
      },
    },
  });
}
