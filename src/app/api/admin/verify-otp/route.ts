"use server";
import { ResponseInstance } from "@/helpers/response-instance";
import { pick } from "lodash";
import { verifyOtpAction } from "@/actions/admin/auth/verify-otp";

/**
 * @swagger
 * /api/admin/verify-otp:
 *   post:
 *     description: Verify admin otp
 *     tags:
 *      - Admin Auth
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            required:
 *              - otp
 *            type: object
 *            properties:
 *              otp:
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
 *                  message: "success.otp_verified"
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
 *                  message: "error.otp_not_found"
 *                  type: "error"
 */
export async function POST(req: Request) {
  const responseInstance = ResponseInstance<any | { access_token: string }>;
  const body: any = await req.json();
  try {
    const res = await verifyOtpAction(pick(body, ["otp"]));
    return Response.json(
      new responseInstance().success(
        typeof res === "string" ? res : res.message,
        pick(res, ["access_token"]),
      ),
    );
  } catch (e: any) {
    return Response.json(new responseInstance().throwError(e), {
      status: e.statusCode,
    });
  }
}
