import { prismaClientSingleton } from "@/helpers/prisma-client-singleton";
import { ENTITY } from "@prisma/client";
import { ICategory } from "@/interfaces/category/category";

export async function createCategoryNameAction(
  body: Pick<ICategory["name"], "name_en" | "name_vi">,
) {
  return prismaClientSingleton.name.create({
    data: {
      name_en: body.name_en,
      name_vi: body.name_vi,
      entity: ENTITY.CATEGORY,
    },
  });
}

export async function createCategoryAction(
  body: Pick<ICategory, "level"> & {
    name_id: number;
    parent_id: number | null;
  },
) {
  return prismaClientSingleton.category.create({
    data: {
      level: body.level,
      name_id: body.name_id,
      parent_id: body.parent_id,
    },
  });
}

export async function findCategoryByIdAction(id: number) {
  return prismaClientSingleton.category.findUnique({
    where: {
      id,
    },
  });
}

export async function deleteCategoryByIdAction(id: number) {
  return prismaClientSingleton.category.delete({
    where: {
      id,
    },
  });
}
