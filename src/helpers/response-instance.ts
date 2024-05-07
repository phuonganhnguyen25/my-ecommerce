import { ZodError } from "zod";

interface IResponseInstance<TData> {
  status: boolean;
  errors: ZodError["errors"] | any[];
  type: "success" | "error" | "validator";
  message: string;
  data: TData;
}

export class ResponseInstance<TData> {
  private instance: IResponseInstance<TData> = {
    status: false,
    errors: [],
    type: "error",
    message: "error.unknown",
    data: [] as TData,
  };

  get() {
    return this.instance;
  }

  success(message: string, data: TData) {
    this.instance.status = true;
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
    }
    return this.get();
  }
}
