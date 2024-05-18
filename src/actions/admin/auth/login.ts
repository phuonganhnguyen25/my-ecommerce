"use server";

import { IAdminRegisterBody } from "@/interfaces/admin/auth";
import { authFormSchema } from "@/validators/auth";
import { prismaClientSingleton } from "@/helpers/prisma-client-singleton";
import { compare } from "bcrypt";
import { CREDENTIAL_TYPE, OTP_REASON } from "@prisma/client";
import { generateOTP } from "@/helpers/otp-generation";
import { getTimeFromMinutes } from "@/helpers/time";
// import { Resend } from "resend";
// import { AdminLoginTemplate } from "@/components/email-template/admin-login";
import dayjs from "dayjs";
import { HttpError } from "@/helpers/error-instance";

export async function adminLoginAction(body: IAdminRegisterBody) {
  try {
    authFormSchema.parse(body);
    const user = await prismaClientSingleton.user.findFirst({
      where: {
        AND: [
          {
            credential: {
              every: { email: body.email, type: CREDENTIAL_TYPE.ADMIN },
            },
          },
          {
            info: {
              every: {
                is_active: true,
                type: CREDENTIAL_TYPE.ADMIN,
              },
            },
          },
        ],
      },
      include: {
        credential: true,
        info: true,
      },
    });
    if (!user) throw new HttpError("error.user_not_found_or_inactive", 404);
    if (!(await compare(body.password, user.credential?.[0]?.password || "")))
      throw new Error("error.user_password_not_match");

    const loginOtp = await prismaClientSingleton.oTP.findFirst({
      where: {
        owner_id: user.id,
        reason: OTP_REASON.LOGIN,
      },
    });

    const otp = generateOTP(6);
    if (!loginOtp) {
      await prismaClientSingleton.oTP.create({
        data: {
          value: otp,
          owner_id: user.id,
          expiry: getTimeFromMinutes(5), // 5 minutes
          reason: OTP_REASON.LOGIN,
        },
      });
    } else {
      if (
        dayjs().isBefore(dayjs(loginOtp.expiry)) &&
        dayjs().isAfter(dayjs(loginOtp.expiry).subtract(10, "minutes"))
      )
        throw new Error("error.login_recent");
      await prismaClientSingleton.oTP.update({
        where: {
          id: loginOtp.id,
        },
        data: {
          value: otp,
          expiry: getTimeFromMinutes(5), // 5 minutes
        },
      });
    }
    // await new Resend(process.env.RESEND_API_KEY).emails.send({
    //   from: "onboarding@resend.dev",
    //   to: body.email,
    //   subject: "New Admin",
    //   react: AdminLoginTemplate({ otp }),
    // } as any);
    return "success.login";
  } catch (e) {
    throw e;
  }
}
