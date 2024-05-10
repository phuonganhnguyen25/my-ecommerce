import * as React from "react";

interface IAdminCreateEmailTemplate {
  otp: string;
}

export const AdminLoginTemplate: React.FC<
  Readonly<IAdminCreateEmailTemplate>
> = ({ otp }) => (
  <div>
    <h1>Welcome to our service</h1>
    <p>OTP: {otp}</p>
  </div>
);
