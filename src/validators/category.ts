import * as z from "zod";
import { nameEnValidator, nameViValidator } from "@/validators/name";
import { ZodError } from "zod";

function findNonUniqueItems(array: any[], property: string) {
  const seenValues = new Set();

  return array.filter((obj) => {
    const value = obj[property];
    if (seenValues.has(value)) {
      return true;
    } else {
      seenValues.add(value);
      return false;
    }
  });
}

export const massUploadSchema = z
  .array(
    z.object({
      name_en: nameEnValidator,
      name_vi: nameViValidator,
    }),
  )
  .refine(
    (arr) => {
      const nameEnSet = new Set(arr.map((x) => x.name_en));
      const nameViSet = new Set(arr.map((x) => x.name_vi));

      // Check uniqueness for both properties
      if (nameEnSet.size !== arr.length) {
        throw new ZodError([
          {
            message: "error.name_must_be_unique",
            path: findNonUniqueItems(arr, "name_en"),
            code: "custom",
          },
        ]);
      } else if (nameViSet.size !== arr.length) {
        throw new ZodError([
          {
            message: "error.name_vi_must_be_unique",
            path: findNonUniqueItems(arr, "name_vi"),
            code: "custom",
          },
        ]);
      }
      return true;
    },
    {
      message: "error.name_must_be_unique",
    },
  );

export const massUploadWithParentSchema = z
  .object({
    with_parent: z.boolean({
      message: "error.mass_upload_with_parent_required",
    }),
    parent_id: z.number({ message: "error.value_must_be_number" }),
  })
  .refine(
    (x) => {
      return !(x.with_parent && x.parent_id < 1);
    },
    { message: "error.parent_id_invalid" },
  );

export const getCategoriesSchema = z.object({
  level: z
    .number({
      message: "error.categories_level_must_be_number",
    })
    .min(0),
  with_child: z.boolean(),
});
