import { ZodError } from "zod";
import { HttpError } from "@/helpers/error-instance";

interface IResponseInstance<TData> {
  status: boolean;
  status_code: number;
  errors: ZodError["errors"] | any[];
  type: "success" | "error" | "validator";
  message: string;
  data: TData;
}

export class ResponseInstance<TData> {
  private instance: IResponseInstance<TData> = {
    status: false,
    status_code: 400,
    errors: [],
    type: "error",
    message: "error.unknown",
    data: [] as TData,
  };

  get() {
    return this.instance;
  }

  success(message: string, data: TData, statusCode: number = 200) {
    this.instance.status = true;
    this.instance.status_code = statusCode;
    this.instance.type = "success";
    this.instance.message = message;
    this.instance.data = data;
    return this.get();
  }

  throwError(e: any) {
    this.instance.status = false;
    if (e instanceof ZodError) {
      this.instance.errors = e.errors;
      this.instance.type = "validator";
      this.instance.message = "error.validation";
    } else if (e instanceof Error) {
      this.instance.type = "error";
      this.instance.message = e.message;
    } else if (e instanceof HttpError) {
    }
    this.instance.status_code = e.statusCode || 400;
    return this.get();
  }
}
