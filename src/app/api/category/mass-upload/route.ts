"use server";

import csv2json from "convert-csv-to-json";
import {
  massUploadSchema,
  massUploadWithParentSchema,
} from "@/validators/category";
import { ResponseInstance } from "@/helpers/response-instance";
import { MassUploadVerifyItem } from "@/interfaces/category/mass-upload";
import {
  deleteMassUploadRequestWithIdAction,
  findMassUploadRequestWithIdAction,
  findMassUploadRequestWithNameAction,
  saveMassUploadRequestAction,
} from "@/actions/category/mass-upload";
import {
  createCategoryAction,
  createCategoryNameAction,
  findCategoryByIdAction,
} from "@/actions/category/name";
import { isEmpty } from "lodash";

/**
 * @swagger
 * /api/category/mass-upload:
 *   post:
 *     description: Send request for mass upload category
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            required:
 *              - file
 *              - with_parent
 *              - parent_id
 *            type: object
 *            properties:
 *              file:
 *                type: string
 *                format: binary
 *                description: CSV file with 2 columns nam_en, name_vi
 *              with_parent:
 *                type: boolean
 *                description: Category is created under parent category or not
 *              parent_id:
 *                type: number
 *                description: Parent category id
 *     responses:
 *       201:
 *         description: Example success request
 *         content:
 *            application/json:
 *              schema:
 *                properties:
 *                  status:
 *                    type: boolean
 *                  errors:
 *                    type: array
 *                  type:
 *                    type: string
 *                  data:
 *                    type: array
 *                  message:
 *                    type: string
 *                example:
 *                  status: true
 *                  data: {
 *                    data: [ { name_en: "", name_vi: "" }],
 *                    id: 1
 *                  }
 *                  errors: []
 *                  message: "success.mass_upload_request_existed"
 *                  type: "success"
 *       400:
 *          description: Example failed request
 *          content:
 *            application/json:
 *              schema:
 *                properties:
 *                  status:
 *                    type: boolean
 *                  errors:
 *                    type: array
 *                  type:
 *                    type: string
 *                  data:
 *                    type: array
 *                  message:
 *                    type: string
 *                example:
 *                  status: false
 *                  data: []
 *                  errors: []
 *                  message: "error.mass_upload_request_existed"
 *                  type: "error"
 */
export async function POST(req: Request) {
  const responseInstance = ResponseInstance<{}>;

  try {
    const fd = await req.formData();
    const file: File = fd.get("file") as File;
    const with_parent: boolean = fd.get("with_parent") === "true";
    const parent_id: number = Number(fd.get("parent_id"));

    massUploadWithParentSchema.parse({ with_parent, parent_id });

    if (await findMassUploadRequestWithNameAction(file.name)) {
      throw new Error("error.mass_upload_request_existed");
    }
    let json = csv2json
      .fieldDelimiter(",")
      .utf8Encoding()
      .parseSubArray("auto", ",")
      .csvStringToJson((await file.text()) || "");

    massUploadSchema.parse(json);

    const savedRequest = await saveMassUploadRequestAction(
      file.name,
      json,
      with_parent ? parent_id : 0,
    );

    return Response.json(
      new responseInstance().success("success.mass_upload_verified", {
        data: json,
        id: savedRequest["id"],
      }),
      {
        status: 201,
      },
    );
  } catch (e) {
    return Response.json(new responseInstance().throwError(e), {
      status: 400,
    });
  }
}

/**
 * @swagger
 * /api/category/mass-upload:
 *   put:
 *     description: Submit request for mass upload category
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            required:
 *              - id
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                description: Mass upload request id
 *     responses:
 *       200:
 *         description: Example success request
 *         content:
 *            application/json:
 *              schema:
 *                properties:
 *                  status:
 *                    type: boolean
 *                  errors:
 *                    type: array
 *                  type:
 *                    type: string
 *                  data:
 *                    type: array
 *                  message:
 *                    type: string
 *                example:
 *                  status: true
 *                  data: []
 *                  errors: []
 *                  message: "success.mass_upload_verified"
 *                  type: "success"
 *       400:
 *          description: Example failed request
 *          content:
 *            application/json:
 *              schema:
 *                properties:
 *                  status:
 *                    type: boolean
 *                  errors:
 *                    type: array
 *                  type:
 *                    type: string
 *                  data:
 *                    type: array
 *                  message:
 *                    type: string
 *                example:
 *                  status: false
 *                  data: []
 *                  errors: []
 *                  message: "error.mass_upload_request_not_found"
 *                  type: "error"
 */
export async function PUT(req: Request) {
  const responseInstance = ResponseInstance<{}>;

  try {
    const fd = await req.formData();
    const savedRequestId: number = Number(fd.get("id"));

    const savedRequest =
      await findMassUploadRequestWithIdAction(savedRequestId);

    if (!savedRequest) {
      throw new Error("error.mass_upload_request_not_found");
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

    return Response.json(
      new responseInstance().success("success.mass_upload_verified", []),
      {
        status: 201,
      },
    );
  } catch (e) {
    return Response.json(new responseInstance().throwError(e), {
      status: 400,
    });
  }
}
