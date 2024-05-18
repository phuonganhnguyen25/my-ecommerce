"use server";

import { prismaClientSingleton } from "@/helpers/prisma-client-singleton";
import { ENTITY } from "@prisma/client";
import {
  massUploadSchema,
  massUploadWithParentSchema,
} from "@/validators/category";
import { HttpError } from "@/helpers/error-instance";
import { MassUploadVerifyItem } from "@/interfaces/category/mass-upload";
import {
  createCategoryAction,
  createCategoryNameAction,
  findCategoryByIdAction,
} from "@/actions/category/name";
import { isEmpty } from "lodash";

export async function saveMassUploadRequestAction(
  name: string,
  json: any,
  parent_id: number,
  with_parent: boolean,
) {
  massUploadWithParentSchema.parse({ with_parent, parent_id });
  if (await findMassUploadRequestWithNameAction(name)) {
    throw new Error("error.mass_upload_request_existed");
  }
  massUploadSchema.parse(json);
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

export async function submitMassUploadRequestWithIdAction(id: number) {
  try {
    const savedRequest = await findMassUploadRequestWithIdAction(id);
    if (!savedRequest) {
      throw new HttpError("error.mass_upload_request_not_found", 404);
    }
    let json: MassUploadVerifyItem[] = savedRequest.json as
      | MassUploadVerifyItem[]
      | any;
    let parent_category: any;
    if (savedRequest.parent_id > 0) {
      parent_category = await findCategoryByIdAction(savedRequest.parent_id);
      if (!parent_category || isEmpty(parent_category)) {
        throw new Error("error.category_not_found");
      }
    }

    massUploadSchema.parse(json);

    json.map(async (x) => {
      await createCategoryNameAction({
        name_en: x.name_en,
        name_vi: x.name_vi,
      }).then(async (x) => {
        await createCategoryAction({
          name_id: x.id,
          level: parent_category?.parent_id ? parent_category.level + 1 : 1,
          parent_id: parent_category?.id || null,
        });
      });
    });
    await deleteMassUploadRequestWithIdAction(savedRequest?.id);
  } catch (e) {
    throw e;
  }
}
