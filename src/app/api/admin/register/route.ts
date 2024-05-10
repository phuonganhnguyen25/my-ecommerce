"use server";

import { ResponseInstance } from "@/helpers/response-instance";
import { AdminRegisterAction } from "@/actions/admin/auth/register";
import { pick } from "lodash";

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     description: Signup new account for admin
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
 *                format: binary
 *                description: Admin email-template
 *              password:
 *                type: string
 *                format: binary
 *                description: Admin password
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
 *                  data: []
 *                  errors: []
 *                  message: "success.register"
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
 *                  message: "\nInvalid `prisma.userCredential.create()` invocation:\n\n\nUnique constraint failed on the fields: (`email-template`)"
 *                  type: "error"
 */
export async function POST(req: Request) {
  const responseInstance = ResponseInstance<any>;
  try {
    const body: any = await req.json();
    const res = await AdminRegisterAction(pick(body, ["email", "password"]));
    return Response.json(new responseInstance().success(res, res));
  } catch (e) {
    return Response.json(new responseInstance().throwError(e), { status: 400 });
  }
}
