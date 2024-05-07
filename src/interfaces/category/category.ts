import { Category, ENTITY } from "@prisma/client";

export interface ICategory
  extends Pick<
    Category,
    "id" | "order" | "level" | "created_at" | "updated_at"
  > {
  parent_id: number | null;
  name: {
    id?: number;
    name_en: string;
    name_vi: string;
    entity?: ENTITY;
  };
}

export interface IGetCategoriesParams {
  level: number;
  with_child: boolean;
}
