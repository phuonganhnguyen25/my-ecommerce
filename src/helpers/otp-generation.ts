export function generateOTP(length: number) {
  const chars = "0123456789";
  const charsLength = chars.length;
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(randomBytes[i] % charsLength);
  }
  return otp;
}
