import { emailRegex, passwordRegex } from "@/constants/shared";

export const isValidEmail = (email: string): boolean => emailRegex.test(email);

export const isValidPassword = (password: string): boolean =>
  passwordRegex.test(password);
