"use server";

import { IAdminVerifyOTPBody } from "@/interfaces/admin/auth";
import { otpFormSchema } from "@/validators/auth";
import { prismaClientSingleton } from "@/helpers/prisma-client-singleton";
import dayjs from "dayjs";
import { CREDENTIAL_TYPE, OTP_REASON } from "@prisma/client";
import { generateOTP } from "@/helpers/otp-generation";
import { getTimeFromMinutes } from "@/helpers/time";
import { sign } from "jsonwebtoken";
import { HttpError } from "@/helpers/error-instance";

export async function verifyOtpAction(body: IAdminVerifyOTPBody) {
  try {
    otpFormSchema.parse(body);
    const otp = await prismaClientSingleton.oTP
      .findFirstOrThrow({
        where: { value: body.otp },
      })
      .catch((e) => {
        if (e.code === "P2025") throw new HttpError("error.otp_not_found", 404);
        throw e;
      });
    if (dayjs(otp.expiry).isBefore(dayjs())) {
      throw new HttpError("error.otp_expired", 400);
    }

    switch (otp.reason) {
      case OTP_REASON.ACTIVATE:
        await prismaClientSingleton.$transaction([
          prismaClientSingleton.userInfo.updateMany({
            where: {
              user_id: otp.owner_id,
            },
            data: {
              is_active: true,
            },
          }),
          prismaClientSingleton.oTP.delete({
            where: {
              id: otp.id,
            },
          }),
        ]);
        return "success.otp_verified";
      case OTP_REASON.LOGIN:
        const sessionOtp = generateOTP(16);
        await prismaClientSingleton.oTP.delete({
          where: {
            id: otp.id,
          },
        });
        const session = await prismaClientSingleton.session.create({
          data: {
            value: sessionOtp,
            expiry: getTimeFromMinutes(60 * 24),
            owner_id: otp.owner_id,
            for: CREDENTIAL_TYPE.ADMIN,
          },
        });
        const access_token = sign(
          {
            value: session.id,
            for: CREDENTIAL_TYPE.ADMIN,
            expiry: session.expiry,
          },
          process.env.JWT_SECRET || "",
          { expiresIn: 60 * 60 * 24 },
        );
        return { message: "success.otp_verified", access_token };
      default:
        return "error.otp_verified";
    }
  } catch (e) {
    throw e;
  }
}
