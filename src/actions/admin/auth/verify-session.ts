"use server";

import { decode, verify } from "jsonwebtoken";
import { prismaClientSingleton } from "@/helpers/prisma-client-singleton";
import { CREDENTIAL_TYPE } from "@prisma/client";
import dayjs from "dayjs";
import { HttpError } from "@/helpers/error-instance";

export async function verifySessionAction(jwt: string) {
  try {
    verify(jwt, process.env.JWT_SECRET || "");
    const _decode: { for: CREDENTIAL_TYPE; value: number | string } = decode(
      jwt,
    ) as any;

    const session = await prismaClientSingleton.session.findUnique({
      where: {
        id: _decode.value as number,
        for: CREDENTIAL_TYPE.ADMIN,
      },
    });
    if (!session || dayjs(session.expiry).isBefore(dayjs()))
      throw new HttpError("error.session_expired", 401);
  } catch (e) {
    throw e;
  }
}
