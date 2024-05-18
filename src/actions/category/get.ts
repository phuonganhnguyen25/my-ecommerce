"use server";

import { prismaClientSingleton } from "@/helpers/prisma-client-singleton";
import {
  ICategory,
  IGetCategoriesParams,
} from "@/interfaces/category/category";
import { getCategoriesSchema } from "@/validators/category";

const SELECT = {
  id: true,
  order: true,
  level: true,
  parent_id: true,
  created_at: true,
  updated_at: true,
  name: {
    select: {
      name_en: true,
      name_vi: true,
    },
  },
};

export async function getCategoriesAction(
  body: IGetCategoriesParams,
): Promise<ICategory[]> {
  getCategoriesSchema.parse(body);
  return prismaClientSingleton.category.findMany({
    orderBy: {
      order: "asc",
    },
    where: { ...(body.level !== 0 ? { level: body.level } : {}) },
    select: {
      ...SELECT,
      ...(body.with_child
        ? {
            children: {
              select: { ...SELECT },
            },
          }
        : {}),
    },
  });
}
