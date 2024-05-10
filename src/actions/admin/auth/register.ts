"use server";

import { hash, genSalt } from "bcrypt";
import { Resend } from "resend";
import { IAdminRegisterBody } from "@/interfaces/admin/auth";
import { authFormSchema } from "@/validators/auth";
import { prismaClientSingleton } from "@/helpers/prisma-client-singleton";
import { $Enums, CREDENTIAL_TYPE } from "@prisma/client";
import { AdminCreateEmailTemplate } from "@/components/email-template/admin-create";
import { generateOTP } from "@/helpers/otp-generation";
import OTP_REASON = $Enums.OTP_REASON;
import { getTimeFromMinutes } from "@/helpers/time";

export async function AdminRegisterAction(body: IAdminRegisterBody) {
  try {
    authFormSchema.parse(body);
    const salt = await genSalt(10);
    const pwd = await hash(body.password, salt);

    const user = await prismaClientSingleton.user.create({});
    const otp = generateOTP(6);
    return await prismaClientSingleton
      .$transaction([
        prismaClientSingleton.userCredential.create({
          data: {
            user_id: user.id,
            email: body.email,
            password: pwd,
            type: CREDENTIAL_TYPE.ADMIN,
          },
        }),
        prismaClientSingleton.userInfo.create({
          data: {
            user_id: user.id,
            first_name: "",
            last_name: "",
            type: CREDENTIAL_TYPE.ADMIN,
          },
        }),
      ])
      .catch(async (e) => {
        await prismaClientSingleton.user.delete({
          where: { id: user.id },
        });
        throw e;
      })
      .then(async (e) => {
        await prismaClientSingleton.oTP.create({
          data: {
            value: otp,
            owner_id: user.id,
            expiry: getTimeFromMinutes(5), // 5 minutes
            reason: OTP_REASON.ACTIVATE,
          },
        });
        await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: "onboarding@resend.dev",
          to: "phuonganhnguyen952501@gmail.com",
          subject: "New Admin",
          react: AdminCreateEmailTemplate({ otp }),
        } as any);
        return "success.register";
      });
  } catch (e) {
    throw e;
  }
}
