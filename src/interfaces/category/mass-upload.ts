import { ICategory } from "@/interfaces/category/category";

export interface MassUploadVerifyItem
  extends Pick<ICategory["name"], "name_en" | "name_vi"> {
  name_en: string;
  name_vi: string;
}
