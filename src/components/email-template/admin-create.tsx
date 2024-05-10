import * as React from "react";

interface IAdminCreateEmailTemplate {
  otp: string;
}

export const AdminCreateEmailTemplate: React.FC<
  Readonly<IAdminCreateEmailTemplate>
> = ({ otp }) => (
  <div>
    <h1>Admin has been successfully created</h1>
    <p>OTP: {otp}</p>
  </div>
);
