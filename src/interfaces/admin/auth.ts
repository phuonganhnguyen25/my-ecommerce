export interface IAdminRegisterBody {
  email: string;
  password: string;
}

export interface IAdminVerifyOTPBody {
  otp: string;
}
