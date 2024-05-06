import { Category, ENTITY } from "@prisma/client";

export interface ICategory
  extends Pick<Category, "order" | "level" | "created_at" | "updated_at"> {
  name: {
    id: number;
    name_en: string;
    name_vi: string;
    entity: ENTITY;
  };
}
