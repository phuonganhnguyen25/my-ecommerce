import * as z from "zod";

export const REGEX_VALID_EN_STR =
  /^[A-Za-z][A-Za-z0-9]*(?: [A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*)*$/;

export const REGEX_VALID_VI_STR =
  /^(?![\p{N}])([\p{L}\p{N}]([\p{L}\p{N} ]*[\p{L}\p{N}])?)?$/u;

export const nameEnValidator = z
  .string()
  .min(1, "error.name_en_min_len")
  .max(30, "error.name_en_max_len")
  .regex(REGEX_VALID_EN_STR, "error.name_en_invalid");

export const nameViValidator = z
  .string()
  .min(1, "error.name_vi_min_len")
  .max(30, "error.name_vi_max_len")
  .regex(REGEX_VALID_VI_STR, "error.name_vi_invalid");
