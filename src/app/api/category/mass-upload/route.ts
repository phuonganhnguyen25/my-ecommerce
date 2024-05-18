"use server";

import csv2json from "convert-csv-to-json";
import { ResponseInstance } from "@/helpers/response-instance";
import {
  saveMassUploadRequestAction,
  submitMassUploadRequestWithIdAction,
} from "@/actions/category/mass-upload";

import { verifySessionAction } from "@/actions/admin/auth/verify-session";

/**
 * @swagger
 * /api/category/mass-upload:
 *   post:
 *     description: Send request for mass upload category
 *     tags:
 *      - Category
 *     security:
 *      - BearerAuth: []
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
  const authorization = (req.headers.get("authorization") ?? "").split(" ");
  const responseInstance = ResponseInstance<{}>;

  try {
    await verifySessionAction(authorization[1]);

    const fd = await req.formData();
    const file: File = fd.get("file") as File;
    const with_parent: boolean = fd.get("with_parent") === "true";
    const parent_id: number = Number(fd.get("parent_id"));

    let json = csv2json
      .fieldDelimiter(",")
      .utf8Encoding()
      .parseSubArray("auto", ",")
      .csvStringToJson((await file.text()) || "");

    const savedRequest = await saveMassUploadRequestAction(
      file.name,
      json,
      with_parent ? parent_id : 0,
      with_parent,
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
  } catch (e: any) {
    return Response.json(new responseInstance().throwError(e), {
      status: e.statusCode,
    });
  }
}

/**
 * @swagger
 * /api/category/mass-upload:
 *   put:
 *     description: Submit request for mass upload category
 *     tags:
 *      - Category
 *     security:
 *      - BearerAuth: []
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

    await submitMassUploadRequestWithIdAction(savedRequestId);

    return Response.json(
      new responseInstance().success("success.mass_upload_verified", []),
    );
  } catch (e: any) {
    return Response.json(new responseInstance().throwError(e), {
      status: e.statusCode,
    });
  }
}
