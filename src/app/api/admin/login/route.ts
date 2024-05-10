"use server";
import { ResponseInstance } from "@/helpers/response-instance";
import { pick } from "lodash";
import { adminLoginAction } from "@/actions/admin/auth/login";

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     description: Login with admin
 *     tags:
 *      - Admin Auth
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            required:
 *              - email
 *              - password
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
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
 *                  message: "success.login"
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
 *                  message: "error.login"
 *                  type: "error"
 */
export async function POST(req: Request) {
  const responseInstance = ResponseInstance<any>;
  const body: any = await req.json();
  try {
    const res = await adminLoginAction(pick(body, ["email", "password"]));
    return Response.json(new responseInstance().success(res, []));
  } catch (e) {
    return Response.json(new responseInstance().throwError(e), { status: 400 });
  }
}
