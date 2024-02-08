import crypto from "crypto";

type Params = {
  salt: string;
  plainPassword: string;
};

export default function getEncryptedPassword({ plainPassword, salt }: Params) {
  try {
    return crypto
      .createHmac("sha256", salt)
      .update(plainPassword)
      .digest("hex");
  } catch (err) {
    console.log(err, "couldn't encrypt password");
    return "";
  }
}
