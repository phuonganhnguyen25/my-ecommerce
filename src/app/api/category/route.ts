import { ResponseInstance } from "@/helpers/response-instance";
import {
  ICategory,
  IGetCategoriesParams,
} from "@/interfaces/category/category";
import { getCategoriesAction } from "@/actions/category/get";
import { NextRequest } from "next/server";
import { verifySessionAction } from "@/actions/admin/auth/verify-session";

/**
 * @swagger
 * /api/category:
 *   get:
 *     description: Get all category
 *     tags:
 *      - Category
 *     components:
 *      securitySchemes:
 *        bearerAuth:
 *          type:
 *            - http
 *            - https
 *          scheme: bearer
 *          bearerFormat: JWT
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: with_child
 *         schema:
 *           type: boolean
 *         required: true
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
 *                  data: {
 *                    data: [
 *                    {
 *                      id: 1,
 *                      order: 1,
 *                      level: 1,
 *                      "created_at": "2024-05-06T14:48:13.652Z",
 *                      "updated_at": "2024-05-06T14:48:13.652Z",
 *                      "parent_id": null,
 *                      name: { name_en: "", name_vi: "" }
 *                    }
 *                  ]
 *                  }
 *                  errors: []
 *                  message: "success.get_categories"
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
 *                  message: "error.get_categories"
 *                  type: "error"
 */
export async function GET(request: NextRequest) {
  const authorization = (request.headers.get("authorization") ?? "").split(" ");

  const responseInstance = ResponseInstance<{ data: ICategory[] }>;
  const searchParams = request.nextUrl.searchParams;

  const params: IGetCategoriesParams = {
    level: Number(searchParams.get("level")),
    with_child: searchParams.get("with_child") === "true",
  };
  try {
    await verifySessionAction(authorization[1]);

    const categories = await getCategoriesAction(params);

    const res = new responseInstance().success("success.get_categories", {
      data: categories,
    });
    return Response.json(res, {
      status: res.status_code,
    });
  } catch (e) {
    const err = new responseInstance().throwError(e);
    return Response.json(err, {
      status: err.status_code,
    });
  }
}
